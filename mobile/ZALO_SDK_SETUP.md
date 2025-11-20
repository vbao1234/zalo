# Hướng dẫn Setup Zalo SDK

## Thông tin ứng dụng

- **App ID**: `4311141813840171987`
- **App Secret**: `23MY8pJILjHcSlZc1Rs5`

Thông tin này đã được cấu hình trong `src/config/zalo.config.ts`

## Setup cho Android

### 1. Thêm Zalo SDK vào `android/app/build.gradle`

```gradle
dependencies {
    // Zalo SDK
    implementation 'com.zing.zalo.zalosdk:core:+'
    implementation 'com.zing.zalo.zalosdk:auth:+'
    implementation 'com.zing.zalo.zalosdk:openapi:+'

    // Existing dependencies...
}
```

### 2. Cấu hình AndroidManifest.xml

Thêm vào `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <application>
        <!-- Zalo App ID -->
        <meta-data
            android:name="com.zing.zalo.zalosdk.AppID"
            android:value="4311141813840171987" />

        <!-- Existing configuration... -->
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>
```

### 3. Tạo Native Module cho Zalo (Java/Kotlin)

Tạo file `android/app/src/main/java/com/zaloaccountmanager/ZaloModule.java`:

```java
package com.zaloaccountmanager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.zing.zalo.zalosdk.oauth.ZaloSDK;
import com.zing.zalo.zalosdk.oauth.OAuthCompleteListener;

public class ZaloModule extends ReactContextBaseJavaModule {
    public ZaloModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ZaloModule";
    }

    @ReactMethod
    public void initialize(String appId, Promise promise) {
        try {
            ZaloSDK.Instance.initialize(getCurrentActivity());
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("INIT_ERROR", e);
        }
    }

    @ReactMethod
    public void login(Promise promise) {
        ZaloSDK.Instance.authenticateZalo(getCurrentActivity(), new OAuthCompleteListener() {
            @Override
            public void onAuthorizeComplete(int errorCode, String userId, String oauthCode) {
                if (errorCode == 0) {
                    // Success
                    WritableMap result = Arguments.createMap();
                    result.putString("userId", userId);
                    result.putString("oauthCode", oauthCode);
                    promise.resolve(result);
                } else {
                    promise.reject("LOGIN_ERROR", "Error code: " + errorCode);
                }
            }
        });
    }
}
```

## Setup cho iOS

### 1. Thêm Zalo SDK vào `ios/Podfile`

```ruby
target 'ZaloAccountManager' do
  # Zalo SDK
  pod 'ZaloSDK'

  # Existing pods...
end
```

Sau đó chạy:
```bash
cd ios
pod install
```

### 2. Cấu hình Info.plist

Thêm vào `ios/ZaloAccountManager/Info.plist`:

```xml
<dict>
    <!-- Zalo App ID -->
    <key>ZaloAppID</key>
    <string>4311141813840171987</string>

    <!-- URL Schemes -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>zalo-4311141813840171987</string>
            </array>
        </dict>
    </array>

    <!-- LSApplicationQueriesSchemes -->
    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>zalo</string>
        <string>zalosdk</string>
    </array>

    <!-- Existing configuration... -->
</dict>
```

### 3. Cấu hình AppDelegate

Thêm vào `ios/ZaloAccountManager/AppDelegate.mm`:

```objc
#import <ZaloSDK/ZaloSDK.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Initialize Zalo SDK
  [[ZaloSDK sharedInstance] initializeWithAppId:@"4311141813840171987"];

  // Existing code...
}

// Handle URL callback
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [[ZaloSDK sharedInstance] application:app openURL:url options:options];
}
```

### 4. Tạo Native Module cho Zalo (Objective-C/Swift)

Tạo file `ios/ZaloModule.h` và `ios/ZaloModule.m`

## Testing

Sau khi setup xong:

1. Rebuild app:
```bash
# Android
cd android && ./gradlew clean && cd ..
npm run android

# iOS
cd ios && pod install && cd ..
npm run ios
```

2. Test Zalo login trên app

## Lưu ý

- **App Secret** chỉ dùng cho backend, không bao giờ expose trên mobile app
- Mobile app chỉ sử dụng **App ID**
- Đảm bảo Zalo app được cài đặt trên thiết bị để test native login
- Nếu Zalo app không có, SDK sẽ fallback sang WebView login

## Tài liệu tham khảo

- [Zalo SDK for Android](https://developers.zalo.me/docs/sdk/android-sdk)
- [Zalo SDK for iOS](https://developers.zalo.me/docs/sdk/ios-sdk)
- [React Native Integration](https://developers.zalo.me/docs/sdk/react-native-sdk)
