package app.aeffy.music;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaMetadataRetriever;
import android.net.Uri;
import android.os.Build;
import android.os.ParcelFileDescriptor;
import android.util.Size;
import android.webkit.WebResourceResponse;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/** Sirve dentro de la app los archivos de música del teléfono y sus portadas. */
public class NativeServer {

    static WebResourceResponse handle(Context ctx, Uri u, Map<String, String> reqHeaders) {
        try {
            String[] parts = u.getPath().split("/");
            if (parts.length < 4) return notFound();
            long id = Long.parseLong(parts[3]);
            if ("audio".equals(parts[2])) return audio(ctx, id, reqHeaders);
            if ("art".equals(parts[2])) {
                int size = 512;
                try { size = Integer.parseInt(u.getQueryParameter("s")); } catch (Exception ignored) { }
                return art(ctx, id, Math.max(64, Math.min(1600, size)));
            }
        } catch (Exception ignored) { }
        return notFound();
    }

    static Map<String, String> baseHeaders() {
        Map<String, String> h = new HashMap<>();
        h.put("Access-Control-Allow-Origin", "*");
        h.put("Cache-Control", "no-store");
        h.put("X-Aeffy", "1");
        h.put("Access-Control-Expose-Headers", "X-Aeffy, Content-Range, Content-Length");
        return h;
    }

    static WebResourceResponse notFound() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", baseHeaders(), new ByteArrayInputStream(new byte[0]));
    }

    static WebResourceResponse audio(Context ctx, long id, Map<String, String> reqHeaders) throws IOException {
        Uri a = NativeBridge.audioUri(id);
        ParcelFileDescriptor pfd = ctx.getContentResolver().openFileDescriptor(a, "r");
        if (pfd == null) return notFound();
        long total = pfd.getStatSize();
        String mime = ctx.getContentResolver().getType(a);
        if (mime == null) mime = "audio/mpeg";
        FileInputStream fis = new ParcelFileDescriptor.AutoCloseInputStream(pfd);
        Map<String, String> h = baseHeaders();
        h.put("Accept-Ranges", "bytes");
        String range = null;
        if (reqHeaders != null) for (Map.Entry<String, String> e : reqHeaders.entrySet()) if ("range".equalsIgnoreCase(e.getKey())) range = e.getValue();
        if (range != null && range.startsWith("bytes=") && total > 0) {
            String[] r = range.substring(6).split("-");
            long start = r.length > 0 && !r[0].isEmpty() ? Long.parseLong(r[0].trim()) : 0;
            long end = r.length > 1 && !r[1].isEmpty() ? Long.parseLong(r[1].trim()) : total - 1;
            end = Math.min(end, total - 1);
            if (start > end) start = 0;
            fis.getChannel().position(start);
            long len = end - start + 1;
            h.put("Content-Range", "bytes " + start + "-" + end + "/" + total);
            h.put("Content-Length", String.valueOf(len));
            return new WebResourceResponse(mime, null, 206, "Partial Content", h, new Limited(fis, len));
        }
        if (total > 0) h.put("Content-Length", String.valueOf(total));
        return new WebResourceResponse(mime, null, 200, "OK", h, fis);
    }

    static WebResourceResponse art(Context ctx, long id, int size) {
        Bitmap bmp = loadArt(ctx, id, size);
        if (bmp == null) return notFound();
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        bmp.compress(Bitmap.CompressFormat.JPEG, 92, bo);
        Map<String, String> h = baseHeaders();
        h.put("Cache-Control", "max-age=86400");
        return new WebResourceResponse("image/jpeg", null, 200, "OK", h, new ByteArrayInputStream(bo.toByteArray()));
    }

    static Bitmap loadArt(Context ctx, long id, int size) {
        Uri a = NativeBridge.audioUri(id);
        MediaMetadataRetriever mmr = new MediaMetadataRetriever();
        try {
            mmr.setDataSource(ctx, a);
            byte[] pic = mmr.getEmbeddedPicture();
            if (pic != null) {
                BitmapFactory.Options o = new BitmapFactory.Options();
                o.inJustDecodeBounds = true;
                BitmapFactory.decodeByteArray(pic, 0, pic.length, o);
                int s = 1;
                while (Math.min(o.outWidth, o.outHeight) / (s * 2) >= size) s *= 2;
                o = new BitmapFactory.Options();
                o.inSampleSize = s;
                Bitmap b = BitmapFactory.decodeByteArray(pic, 0, pic.length, o);
                if (b != null) return b;
            }
        } catch (Exception ignored) {
        } finally {
            try { mmr.release(); } catch (Exception ignored) { }
        }
        if (Build.VERSION.SDK_INT >= 29) {
            try { return ctx.getContentResolver().loadThumbnail(a, new Size(size, size), null); } catch (Exception ignored) { }
        }
        return null;
    }

    static class Limited extends FilterInputStream {
        long left;
        Limited(InputStream in, long n) { super(in); left = n; }
        @Override public int read() throws IOException { if (left <= 0) return -1; int r = super.read(); if (r >= 0) left--; return r; }
        @Override public int read(byte[] b, int off, int len) throws IOException {
            if (left <= 0) return -1;
            int r = super.read(b, off, (int) Math.min(len, left));
            if (r > 0) left -= r;
            return r;
        }
    }
}
