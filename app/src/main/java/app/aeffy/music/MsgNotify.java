package app.aeffy.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;

public class MsgNotify {
    static final String CH = "aeffy_mensajes";

    static void channel(Context c) {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = c.getSystemService(NotificationManager.class);
            if (nm.getNotificationChannel(CH) == null) {
                NotificationChannel ch = new NotificationChannel(CH, "Mensajes", NotificationManager.IMPORTANCE_HIGH);
                ch.setDescription("Mensajes de tus amigos en aeffy");
                nm.createNotificationChannel(ch);
            }
        }
    }

    static void show(Context c, String id, String title, String body, String url) {
        try {
            channel(c);
            Intent open = new Intent(c, MainActivity.class).setAction(Intent.ACTION_VIEW)
                .setData(Uri.parse(url == null || url.isEmpty() ? "https://" + MainActivity.HOST + "/#/mensajes" : url))
                .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
            int code = id == null ? 0 : id.hashCode();
            PendingIntent pi = PendingIntent.getActivity(c, code, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CH) : new Notification.Builder(c);
            b.setSmallIcon(R.drawable.ic_stat_aeffy).setContentTitle(title).setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setAutoCancel(true).setContentIntent(pi).setCategory(Notification.CATEGORY_MESSAGE)
                .setGroup("aeffy_msgs");
            if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_HIGH).setDefaults(Notification.DEFAULT_ALL);
            c.getSystemService(NotificationManager.class).notify("msg", code, b.build());
        } catch (Exception ignored) { }
    }
}
