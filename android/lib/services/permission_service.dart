import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

/// Service de gestion des permissions Android / iOS pour RELAIS237
/// Utilise le package Flutter `permission_handler: ^11.0.0`
class Relais237PermissionService {
  /// 1. Demande d'accès à la Caméra (photo colis & scan CNI)
  static Future<bool> demanderAccesCamera() async {
    PermissionStatus status = await Permission.camera.request();

    if (status.isGranted) {
      debugPrint('[RELAIS237] Permission Caméra accordée.');
      return true;
    } else if (status.isDenied) {
      debugPrint('[RELAIS237] Permission Caméra refusée temporairement.');
      return false;
    } else if (status.isPermanentlyDenied) {
      debugPrint('[RELAIS237] Permission Caméra refusée en permanence -> Redirection Paramètres.');
      await openAppSettings();
      return false;
    }
    return false;
  }

  /// 2. Demande d'accès à la Galerie & Photos (READ_MEDIA_IMAGES sur Android 13+)
  static Future<bool> demanderAccesGalerie() async {
    PermissionStatus status = await Permission.photos.request();

    if (status.isGranted) {
      debugPrint('[RELAIS237] Permission Galerie photos accordée.');
      return true;
    } else if (status.isDenied) {
      debugPrint('[RELAIS237] Permission Galerie refusée.');
      return false;
    } else if (status.isPermanentlyDenied) {
      await openAppSettings();
      return false;
    }
    return false;
  }

  /// 3. Demande d'accès à la Géolocalisation (suivi en direct du livreur Douala/Yaoundé)
  static Future<bool> demanderAccesLocalisation() async {
    PermissionStatus status = await Permission.locationWhenInUse.request();

    if (status.isGranted) {
      debugPrint('[RELAIS237] Permission Géolocalisation accordée.');
      return true;
    } else if (status.isDenied) {
      debugPrint('[RELAIS237] Permission Géolocalisation refusée.');
      return false;
    } else if (status.isPermanentlyDenied) {
      await openAppSettings();
      return false;
    }
    return false;
  }

  /// 4. Demande d'accès aux Contacts (sélection rapide récepteur MTN/Orange)
  static Future<bool> demanderAccesContacts() async {
    PermissionStatus status = await Permission.contacts.request();

    if (status.isGranted) {
      debugPrint('[RELAIS237] Permission Carnet d\'adresses accordée.');
      return true;
    } else if (status.isDenied) {
      debugPrint('[RELAIS237] Permission Contacts refusée.');
      return false;
    } else if (status.isPermanentlyDenied) {
      await openAppSettings();
      return false;
    }
    return false;
  }
}
