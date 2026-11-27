package app.aeffy.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/** Mantiene la música sonando con la pantalla apagada y muestra los controles. */
public class PlayerService extends Service {
    static final String ACTION_UPDATE = "app.aeffy.music.UPDATE";
    static final String CH = "aeffy_playback";
    static volatile boolean running = false;
    private MediaSession session;
    private PowerManager.WakeLock lock;
    private long lastArtId = -2;
    private Bitmap art;

    @Override
    public void onCreate() {
        super.onCreate();
        running = true;
        NotificationManager nm = getSystemService(NotificationManager.class);
        NotificationChannel ch = new NotificationChannel(CH, "Reproducción", NotificationManager.IMPORTANCE_LOW);
        ch.setShowBadge(false);
        nm.createNotificationChannel(ch);
        session = new MediaSession(this, "aeffy");
        session.setCallback(new MediaSession.Callback() {
            @Override public void onPlay() { call("A.P.au.play()"); }
            @Override public void onPause() { call("A.P.au.pause()"); }
            @Override public void onSkipToNext() { call("A.next()"); }
            @Override public void onSkipToPrevious() { call("A.prev()"); }
            @Override public void onSeekTo(long pos) { call("A.P.au.currentTime=" + (pos / 1000.0)); }
            @Override public void onStop() { call("A.P.au.pause()"); }
        });
        session.setActive(true);
        PowerManager pm = getSystemService(PowerManager.class);
        lock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "aeffy:play");
    }

    static void call(String js) {
        MainActivity a = MainActivity.instance;
        if (a != null) a.js("window.A && (" + js + ")");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent == null ? null : intent.getAction();
        if ("prev".equals(action)) { call("A.prev()"); return START_NOT_STICKY; }
        if ("next".equals(action)) { call("A.next()"); return START_NOT_STICKY; }
        if ("toggle".equals(action)) { call("A.toggle()"); return START_NOT_STICKY; }
        if (intent == null) { startForegroundCompat(build("aeffy", "", false)); return START_NOT_STICKY; }

        String title = intent.getStringExtra("title");
        String artist = intent.getStringExtra("artist");
        String album = intent.getStringExtra("album");
        boolean playing = intent.getBooleanExtra("playing", false);
        long mediaId = intent.getLongExtra("mediaId", -1);
        long pos = intent.getLongExtra("position", 0);
        long dur = intent.getLongExtra("duration", 0);

        if (mediaId != lastArtId) {
            lastArtId = mediaId;
            art = mediaId >= 0 ? NativeServer.loadArt(this, mediaId, 512) : null;
        }
        MediaMetadata.Builder mb = new MediaMetadata.Builder()
            .putString(MediaMetadata.METADATA_KEY_TITLE, title == null ? "" : title)
            .putString(MediaMetadata.METADATA_KEY_ARTIST, artist == null ? "" : artist)
            .putString(MediaMetadata.METADATA_KEY_ALBUM, album == null ? "" : album)
            .putLong(MediaMetadata.METADATA_KEY_DURATION, dur);
        if (art != null) mb.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, art);
        session.setMetadata(mb.build());
        session.setPlaybackState(new PlaybackState.Builder()
            .setActions(PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE | PlaybackState.ACTION_PLAY_PAUSE
                | PlaybackState.ACTION_SKIP_TO_NEXT | PlaybackState.ACTION_SKIP_TO_PREVIOUS | PlaybackState.ACTION_SEEK_TO | PlaybackState.ACTION_STOP)
            .setState(playing ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED, pos, playing ? 1f : 0f)
            .build());

        startForegroundCompat(build(title, artist, playing));
        if (playing) { if (!lock.isHeld()) lock.acquire(6 * 60 * 60 * 1000L); }
        else {
            if (lock.isHeld()) lock.release();
            stopForeground(STOP_FOREGROUND_DETACH);
        }
        return START_NOT_STICKY;
    }

    private void startForegroundCompat(Notification n) {
        if (Build.VERSION.SDK_INT >= 29) startForeground(7, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(7, n);
    }

    private PendingIntent pi(String action, int code) {
        Intent i = new Intent(this, PlayerService.class).setAction(action);
        return PendingIntent.getService(this, code, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private Notification build(String title, String artist, boolean playing) {
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent content = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder b = new Notification.Builder(this, CH)
            .setSmallIcon(R.drawable.ic_stat_aeffy)
            .setContentTitle(title == null || title.isEmpty() ? "aeffy" : title)
            .setContentText(artist == null ? "" : artist)
            .setContentIntent(content)
            .setOngoing(playing)
            .setShowWhen(false)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(new Notification.Action.Builder(android.R.drawable.ic_media_previous, "Anterior", pi("prev", 1)).build())
            .addAction(new Notification.Action.Builder(playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play, playing ? "Pausar" : "Reproducir", pi("toggle", 2)).build())
            .addAction(new Notification.Action.Builder(android.R.drawable.ic_media_next, "Siguiente", pi("next", 3)).build())
            .setStyle(new Notification.MediaStyle().setMediaSession(session.getSessionToken()).setShowActionsInCompactView(0, 1, 2));
        if (art != null) b.setLargeIcon(art);
        return b.build();
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        running = false;
        if (lock != null && lock.isHeld()) lock.release();
        if (session != null) { session.setActive(false); session.release(); }
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }
}
