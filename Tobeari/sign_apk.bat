cd "C:\Users\AlgaboW\GoogleDrive\Dev\www\Tobeari\android"

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "C:\Users\AlgaboW\GoogleDrive\Documents\Project\Tobeari\Signing\tobeari.keystore" "android-armv7-release-unsigned.apk" TobeariKeystore

jarsigner -verify -verbose -certs "android-armv7-release-unsigned.apk"

zipalign -v 4 "android-armv7-release-unsigned.apk" tobeari.apk

pause