package com.meffy.bolsillito;

import com.google.androidbrowserhelper.trusted.NotificationPermissionRequestHandler;

public class DelegationService extends com.google.androidbrowserhelper.trusted.DelegationService {
    @Override
    public void onCreate() {
        super.onCreate();
        registerExtraCommandHandler(new NotificationPermissionRequestHandler());
    }
}
