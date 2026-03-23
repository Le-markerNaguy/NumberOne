# 🔔 Fichiers audio

Ajoutez votre fichier audio de cloche ici : `bell.mp3`

Les formats supportés :
- ✅ MP3
- ✅ WAV
- ✅ OGG

## Instructions

1. Téléchargez ou créez un fichier audio de cloche (exemples libres sur Freesound.org ou Pixabay)
2. Renommez-le `bell.mp3` 
3. Placez-le dans ce dossier (`/public/sounds/`)
4. Le son se jouera automatiquement quand une commande est confirmée

## Exemple de commandes pour créer un son avec ffmpeg :

```bash
# Générer un son de cloche basique avec ffmpeg
ffmpeg -f lavfi -i "sine=f=2000:d=0.5" -af "adelay=0|0,compand=0|0 -90|-90 -45|-45 0|-20 0|-20 0|0 -5 -10" bell.mp3
```

Ou utilisez un générateur en ligne : https://www.zedge.net/ringtones
