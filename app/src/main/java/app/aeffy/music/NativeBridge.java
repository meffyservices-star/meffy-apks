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

    @JavascriptInterface public String version() { return "1.3.0"; }
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


    /* notificaciones de mensajes */
    @JavascriptInterface
    public void notify(String id, String title, String body, String url) {
        MsgNotify.show(act, id, title, body, url);
    }
    @JavascriptInterface
    public void setDeviceKey(String key) {
        act.getSharedPreferences("aeffy", 0).edit().putString("devkey", key).apply();
        MsgJob.schedule(act);
    }
    @JavascriptInterface
    public void notified(long lastId) {
        android.content.SharedPreferences sp = act.getSharedPreferences("aeffy", 0);
        if (lastId > sp.getLong("lastmsg", 0)) sp.edit().putLong("lastmsg", lastId).apply();
    }
    @JavascriptInterface
    public boolean canNotify() {
        return Build.VERSION.SDK_INT < 33 || act.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == android.content.pm.PackageManager.PERMISSION_GRANTED;
    }
    @JavascriptInterface
    public void askNotify() {
        if (Build.VERSION.SDK_INT >= 33) act.runOnUiThread(() -> act.requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 13));
    /* ---------- Ahorrar espacio ---------- */
    @JavascriptInterface public boolean needWrite() { return !act.hasWritePermission(); }
    @JavascriptInterface public void requestWrite() { act.runOnUiThread(act::requestWritePermission); }

    /** Guarda una canción comprimida en Música/aeffy y devuelve su id de MediaStore (o -1) */
    @JavascriptInterface
    public long saveAudio(String name, String base64, String title, String artist, String album, String mime) {
        try {
            byte[] data = Base64.decode(base64, Base64.DEFAULT);
            String safe = name.replaceAll("[\\\\/:*?\"<>|]", "_");
            ContentResolver cr = act.getContentResolver();
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_MUSIC + "/aeffy");
                v.put(MediaStore.Audio.Media.IS_PENDING, 1);
                if (title != null && !title.isEmpty()) v.put(MediaStore.Audio.Media.TITLE, title);
                Uri u = cr.insert(MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY), v);
                if (u == null) return -1;
                try (OutputStream os = cr.openOutputStream(u)) { os.write(data); }
                ContentValues done = new ContentValues();
                done.put(MediaStore.Audio.Media.IS_PENDING, 0);
                cr.update(u, done, null, null);
                return ContentUris.parseId(u);
            } else {
                File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC), "aeffy");
                dir.mkdirs();
                File f = new File(dir, safe);
                try (FileOutputStream fos = new FileOutputStream(f)) { fos.write(data); }
                final long[] id = {-1};
                final java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
                android.media.MediaScannerConnection.scanFile(act, new String[]{f.getAbsolutePath()}, new String[]{mime}, (path, uri) -> {
                    try { if (uri != null) id[0] = ContentUris.parseId(uri); } catch (Exception ignored) { }
                    latch.countDown();
                });
                latch.await(15, java.util.concurrent.TimeUnit.SECONDS);
                return id[0];
            }
        } catch (Exception e) {
            return -1;
        }
    }

    /** Borra las canciones originales. Devuelve "asked" (el sistema pregunta), "done" o "fail" */
    @JavascriptInterface
    public String deleteMedia(String idsJson) {
        try {
            JSONArray a = new JSONArray(idsJson);
            java.util.List<Uri> uris = new java.util.ArrayList<>();
            for (int i = 0; i < a.length(); i++) uris.add(audioUri(a.getLong(i)));
            if (uris.isEmpty()) return "done";
            if (Build.VERSION.SDK_INT >= 30) { act.runOnUiThread(() -> act.requestDelete(uris)); return "asked"; }
            if (!act.hasWritePermission()) return "fail";
            ContentResolver cr = act.getContentResolver();
            int n = 0;
            for (Uri u : uris) {
                try {
                    if (Build.VERSION.SDK_INT < 29) {
                        try (Cursor c = cr.query(u, new String[]{"_data"}, null, null, null)) {
                            if (c != null && c.moveToFirst()) { String p = c.getString(0); if (p != null) new File(p).delete(); }
                        }
                    }
                    n += cr.delete(u, null, null);
                } catch (Exception ignored) { }
            }
            return n > 0 ? "done" : "fail";
        } catch (Exception e) {
            return "fail";
        }
    }

    static Uri audioUri(long id) { return ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id); }

    private static String nz(String s) { return s == null || "<unknown>".equals(s) ? "" : s; }
}
