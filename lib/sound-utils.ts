/**
 * Joue un son de notification (cloche) pour les nouvelles commandes
 * @param soundPath Chemin vers le fichier audio (par défaut: /sounds/bell.mp3)
 */
export function playBellSound(soundPath = "/sounds/bell.mp3") {
  try {
    const audio = new Audio(soundPath)
    audio.volume = 0.8 // Volume à 80% pour bien l'entendre
    audio.play().catch((err) => {
      console.warn("Impossible de jouer le son:", err)
    })
  } catch (error) {
    console.warn("Erreur lors de la lecture du son:", error)
  }
}
