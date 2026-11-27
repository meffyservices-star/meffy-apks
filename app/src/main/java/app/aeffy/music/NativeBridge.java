package app.aeffy.music;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class NativeBridge {
    private final MainActivity act;

    NativeBridge(MainActivity a) { act = a; }

    @JavascriptInterface public String version() { return "1.1.0"; }
    @JavascriptInterface public int sdk() { return Build.VERSION.SDK_INT; }
    @JavascriptInterface public boolean hasPermission() { return act.hasMusicPermission(); }
    @JavascriptInterface public void requestPermission() { act.runOnUiThread(act::requestMusicPermission); }
    @JavascriptInterface public void openExternal(String url) { act.runOnUiThread(() -> act.openExternal(url)); }

    @JavascriptInterface
    public String scan() {
        JSONArray out = new JSONArray();
        if (!act.hasMusicPermission()) return out.toString();
        ContentResolver cr = act.getContentResolver();
        Uri uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
        boolean q = Build.VERSION.SDK_INT >= 29;
        String[] proj = q
            ? new String[]{"_id", "title", "artist", "album", "album_id", "duration", "track", "year", "_size", "mime_type", "date_added", "_display_name", "relative_path", "album_artist"}
            : new String[]{"_id", "title", "artist", "album", "album_id", "duration", "track", "year", "_size", "mime_type", "date_added", "_display_name", "_data"};
        String sel = "is_music != 0 OR duration >= 30000";
        try (Cursor c = cr.query(uri, proj, sel, null, "date_added DESC")) {
            if (c == null) return out.toString();
            while (c.moveToNext()) {
                try {
                    JSONObject o = new JSONObject();
                    o.put("id", c.getLong(0));
                    o.put("title", nz(c.getString(1)));
                    o.put("artist", nz(c.getString(2)));
                    o.put("album", nz(c.getString(3)));
                    o.put("albumId", c.getLong(4));
                    o.put("duration", c.getLong(5));
                    o.put("track", c.getInt(6));
                    o.put("year", c.getInt(7));
                    o.put("size", c.getLong(8));
                    o.put("mime", nz(c.getString(9)));
                    o.put("added", c.getLong(10));
                    o.put("name", nz(c.getString(11)));
                    String path = nz(c.getString(12));
                    if (!q && path.contains("/")) {
                        path = path.substring(0, path.lastIndexOf('/'));
                        int i = path.indexOf("/0/");
                        if (i >= 0) path = path.substring(i + 3);
                    }
                    o.put("path", path.replaceAll("/+$", ""));
                    if (q) o.put("albumArtist", nz(c.getString(13)));
                    out.put(o);
                } catch (Exception ignored) { }
            }
        } catch (Exception e) {
            return out.toString();
        }
        return out.toString();
    }

    @JavascriptInterface
    public void nowPlaying(String title, String artist, String album, boolean playing, long mediaId, double position, double duration) {
        Intent i = new Intent(act, PlayerService.class);
        i.setAction(PlayerService.ACTION_UPDATE);
        i.putExtra("title", title);
        i.putExtra("artist", artist);
        i.putExtra("album", album);
        i.putExtra("playing", playing);
        i.putExtra("mediaId", mediaId);
        i.putExtra("position", (long) (position * 1000));
        i.putExtra("duration", (long) (duration * 1000));
        try {
            if (playing) act.startForegroundService(i);
            else if (PlayerService.running) act.startService(i);
        } catch (Exception ignored) { }
    }

    @JavascriptInterface
    public void stopped() {
        act.stopService(new Intent(act, PlayerService.class));
    }

    @JavascriptInterface
    public boolean saveFile(String name, String mime, String base64) {
        try {
            byte[] data = Base64.decode(base64, Base64.DEFAULT);
            String safe = name.replaceAll("[\\\\/:*?\"<>|]", "_");
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                v.put(MediaStore.MediaColumns.MIME_TYPE, mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/aeffy");
                Uri u = act.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (u == null) return false;
                try (OutputStream os = act.getContentResolver().openOutputStream(u)) { os.write(data); }
            } else {
                File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "aeffy");
                dir.mkdirs();
                try (FileOutputStream fos = new FileOutputStream(new File(dir, safe))) { fos.write(data); }
            }
            act.runOnUiThread(() -> Toast.makeText(act, "Guardado en Descargas/aeffy", Toast.LENGTH_SHORT).show());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    static Uri audioUri(long id) { return ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id); }

    private static String nz(String s) { return s == null || "<unknown>".equals(s) ? "" : s; }
}
