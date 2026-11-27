package app.aeffy.music;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    public static final String HOST = "aeffy.vercel.app";
    public static final String HOME = "https://" + HOST + "/?src=app#/inicio";
    static MainActivity instance;
    WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private static final int REQ_FILES = 11, REQ_PERM = 12;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        instance = this;
        getWindow().setStatusBarColor(Color.parseColor("#0E1016"));
        getWindow().setNavigationBarColor(Color.parseColor("#0E1016"));
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0E1016"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportMultipleWindows(false);
        s.setUserAgentString(s.getUserAgentString() + " aeffyApp/" + BuildConfigInfo.VERSION);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        if (Build.VERSION.SDK_INT >= 26) web.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);

        web.addJavascriptInterface(new NativeBridge(this), "AeffyNative");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost()) && u.getPath() != null && u.getPath().startsWith("/__native/")) {
                    return NativeServer.handle(MainActivity.this, u, req.getRequestHeaders());
                }
                return null;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                String h = u.getHost() == null ? "" : u.getHost();
                if (h.equals(HOST) || h.endsWith(".supabase.co")) return false;
                openExternal(u.toString());
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                CookieManager.getInstance().flush();
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                String[] types = p.getAcceptTypes();
                boolean images = types != null && types.length > 0 && types[0] != null && types[0].startsWith("image");
                i.setType(images ? "image/*" : "*/*");
                if (!images) i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"audio/*", "application/octet-stream", "text/plain", "application/json"});
                i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                try {
                    startActivityForResult(Intent.createChooser(i, "Elegir archivos"), REQ_FILES);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> request.deny());
            }
        });

        Uri data = getIntent() != null ? getIntent().getData() : null;
        web.loadUrl(urlFor(data));
    }

    static String urlFor(Uri data) {
        if (data != null && HOST.equals(data.getHost())) {
            String u = data.toString();
            if (!u.contains("src=app")) {
                String q = data.getQuery();
                String base = data.getScheme() + "://" + data.getHost() + (data.getPath() == null ? "/" : data.getPath());
                String frag = data.getFragment();
                u = base + "?" + (q == null || q.isEmpty() ? "" : q + "&") + "src=app" + (frag != null ? "#" + frag : "");
            }
            return u;
        }
        return HOME;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        Uri data = intent.getData();
        if (data != null && HOST.equals(data.getHost()) && web != null) {
            String q = data.getQuery();
            if (q != null && q.contains("code=")) web.loadUrl(urlFor(data));
            else if (data.getFragment() != null) js("location.hash=" + jsStr("#" + data.getFragment()));
            else web.loadUrl(urlFor(data));
        }
    }

    void openExternal(String url) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            Toast.makeText(this, "No hay un navegador para abrir esto", Toast.LENGTH_SHORT).show();
        }
    }

    void requestMusicPermission() {
        List<String> p = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= 33) {
            p.add(Manifest.permission.READ_MEDIA_AUDIO);
            p.add(Manifest.permission.POST_NOTIFICATIONS);
        } else {
            p.add(Manifest.permission.READ_EXTERNAL_STORAGE);
        }
        requestPermissions(p.toArray(new String[0]), REQ_PERM);
    }

    boolean hasMusicPermission() {
        String p = Build.VERSION.SDK_INT >= 33 ? Manifest.permission.READ_MEDIA_AUDIO : Manifest.permission.READ_EXTERNAL_STORAGE;
        return checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        super.onRequestPermissionsResult(code, perms, res);
        if (code == REQ_PERM) js("window.AeffyNativeCb && AeffyNativeCb('perm'," + hasMusicPermission() + ")");
    }

    @Override
    protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code == REQ_FILES && fileCallback != null) {
            Uri[] out = null;
            if (result == RESULT_OK && data != null) {
                ClipData cd = data.getClipData();
                if (cd != null) {
                    out = new Uri[cd.getItemCount()];
                    for (int i = 0; i < cd.getItemCount(); i++) out[i] = cd.getItemAt(i).getUri();
                } else if (data.getData() != null) out = new Uri[]{data.getData()};
            }
            fileCallback.onReceiveValue(out);
            fileCallback = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        web.evaluateJavascript("(window.A && A.nativeBack) ? A.nativeBack() : false", v -> {
            if (!"true".equals(v)) moveTaskToBack(true);
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        js("window.AeffyNativeCb && AeffyNativeCb('resume', true)");
    }

    @Override
    protected void onDestroy() {
        if (instance == this) instance = null;
        stopService(new Intent(this, PlayerService.class));
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }

    public void js(String code) {
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript(code, null); });
    }

    static String jsStr(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c < 32 || c == 0x2028 || c == 0x2029) b.append(String.format("\\u%04x", (int) c));
            else b.append(c);
        }
        return b.append('"').toString();
    }

    static class BuildConfigInfo { static final String VERSION = "1.1.0"; }
}
