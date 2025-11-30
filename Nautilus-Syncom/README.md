# NautilusSyncom

| Info    | Det.                 |
|---------|----------------------|
| Version | 0.31                 |
| Editeur | ROUIS Mohamed-Yassin |
| Board   | ESP32 Dev Module     |
| B Vers. | 2.0.0                |

## Compilation (Arduino IDE)

1. Ouvrez l’IDE Arduino.
2. Sélectionnez la carte et le port appropriés dans le menu **Outils**.
3. Ouvrez le fichier principal du projet (`NautilusSyncom.ino`).
4. Cliquez sur **Téléverser** pour compiler et envoyer le code à la carte.

## Commandes (Serial)

Envoyez les commandes suivantes via le moniteur série (sans majuscules, chaque commande suivie d’un retour à la ligne) :

### Commandes disponibles

| Commande | Description |
|----------|-------------|
| `isready` | Vérifie si le système est prêt. |
| `motor` | Contrôle les moteurs (voir détails ci-dessous). |
| `relay` | Contrôle les relais (voir détails ci-dessous). |
| `rgblight` | Contrôle la bande LED RGB (voir détails ci-dessous). |

---

### Détails des commandes

#### Moteurs

- `motor <id | all> speed get` : Obtenir la vitesse du moteur.
- `motor <id | all> speed set <valeur>` : Définir la vitesse du moteur.
- `motor <id | all> stop` : Arrêter le moteur.
- `motor <id | all> calibrate` : Calibrer le moteur.
- `motor <id | all> reset` : Réinitialiser le moteur.

#### Relais

- `relay <1-4 | all> set <on | off>` : Allumer ou éteindre un relais.
- `relay <1-4 | all> get` : Obtenir l’état d’un relais.
- `relay <1-4 | all> toggle` : Inverser l’état d’un relais.

#### Bande RGB

- `rgblight brightness get` : Obtenir la luminosité.
- `rgblight brightness set <0-255>` : Définir la luminosité.
- `rgblight color get` : Obtenir la couleur actuelle.
- `rgblight color set <r> <g> <b>` : Définir la couleur (0-255 pour chaque composant).
- `rgblight on` : Allumer la bande.
- `rgblight off` : Éteindre la bande.

---

> **Remarque :** Les commandes sont sensibles à la casse et doivent être envoyées telles qu’indiquées.