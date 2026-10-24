package com.meffy.bolsillito;

import com.google.androidbrowserhelper.trusted.NotificationDelegationExtraCommandHandler;

public class DelegationService extends com.google.androidbrowserhelper.trusted.DelegationService {
    @Override
    public void onCreate() {
        super.onCreate();
        registerExtraCommandHandler(new NotificationDelegationExtraCommandHandler());
    }
}
