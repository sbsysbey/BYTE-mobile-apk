package com.byteacademy.app;

import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		if (bridge == null || bridge.getWebView() == null) {
			return;
		}

		WebSettings webSettings = bridge.getWebView().getSettings();
		webSettings.setSupportZoom(true);
		webSettings.setBuiltInZoomControls(true);
		webSettings.setDisplayZoomControls(false);
		webSettings.setUseWideViewPort(true);
		webSettings.setLoadWithOverviewMode(true);
	}
}
