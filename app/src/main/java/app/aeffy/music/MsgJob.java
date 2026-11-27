package app.aeffy.music;

import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/* Revisa mensajes nuevos cada ~15 min aunque aeffy esté cerrada */
public class MsgJob extends JobService {
    static final int ID = 4711;
    static final String URL_RPC = "https://nhyxgfnjjzrdwshiuoyo.supabase.co/rest/v1/rpc/aeffy_device_unread";
    static final String ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeXhnZm5qanpyZHdzaGl1b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MDU2MjQsImV4cCI6MjEwNzE4MTYyNH0.S31nLaZ4qNgxAPLsYEzXhBMHeIemwbLTl5IFkIVQfUA";

    static void schedule(Context c) {
        JobScheduler js = c.getSystemService(JobScheduler.class);
        if (js == null) return;
        for (JobInfo j : js.getAllPendingJobs()) if (j.getId() == ID) return;
        JobInfo info = new JobInfo.Builder(ID, new ComponentName(c, MsgJob.class))
            .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
            .setPeriodic(15 * 60 * 1000L)
            .setPersisted(true)
            .build();
        js.schedule(info);
    }

    @Override
    public boolean onStartJob(JobParameters params) {
        new Thread(() -> { check(getApplicationContext()); jobFinished(params, false); }).start();
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) { return true; }

    static void check(Context c) {
        SharedPreferences sp = c.getSharedPreferences("aeffy", 0);
        String key = sp.getString("devkey", null);
        if (key == null) return;
        MainActivity a = MainActivity.instance;
        if (a != null && a.resumed) return; /* la app abierta ya avisa sola */
        try {
            long last = sp.getLong("lastmsg", 0);
            HttpURLConnection h = (HttpURLConnection) new URL(URL_RPC).openConnection();
            h.setRequestMethod("POST"); h.setDoOutput(true); h.setConnectTimeout(15000); h.setReadTimeout(15000);
            h.setRequestProperty("apikey", ANON); h.setRequestProperty("Authorization", "Bearer " + ANON);
            h.setRequestProperty("Content-Type", "application/json");
            JSONObject body = new JSONObject(); body.put("p_key", key); body.put("p_after", last);
            try (OutputStream os = h.getOutputStream()) { os.write(body.toString().getBytes("UTF-8")); }
            if (h.getResponseCode() != 200) return;
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            try (InputStream in = h.getInputStream()) { byte[] buf = new byte[4096]; int n; while ((n = in.read(buf)) > 0) bo.write(buf, 0, n); }
            JSONArray arr = new JSONArray(bo.toString("UTF-8"));
            long max = last;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject m = arr.getJSONObject(i);
                long id = m.getLong("id"); if (id > max) max = id;
                String kind = m.optString("kind"), text = "text".equals(kind) ? m.optString("body") : "song".equals(kind) ? "🎵 Te mandó una canción" : "Te mandó un sticker";
                MsgNotify.show(c, "m" + m.optString("sender"), m.optString("name", "aeffy"), text, "https://" + MainActivity.HOST + "/#/chat/" + m.optString("sender"));
            }
            if (max > last) sp.edit().putLong("lastmsg", max).apply();
        } catch (Exception ignored) { }
    }
}
