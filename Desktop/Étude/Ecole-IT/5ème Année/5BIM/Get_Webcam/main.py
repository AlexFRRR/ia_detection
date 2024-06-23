import asyncio

import cv2
import torch
from dotenv import load_dotenv

load_dotenv()


async def process_local_camera():
    # Charger le modèle YOLOv5
    model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
    model.conf = 0.4  # seuil de confiance
    model.iou = 0.6  # seuil de suppression non maximale

    cap = cv2.VideoCapture(0)  # Utilisation de la caméra locale (index 0)

    if not cap.isOpened():
        print("Erreur d'ouverture de la caméra locale")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Détection d'objets avec YOLOv5
        results = model(frame)

        # Annoter les résultats sur les images avec code couleur
        frame = annotate_frame(frame, results)

        # Afficher les images
        cv2.imshow('Web Camera', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


def get_color(class_id):
    # Palette de couleurs
    palette = [
        (255, 0, 0), (0, 255, 0), (0, 0, 255),
        (255, 255, 0), (0, 255, 255), (255, 0, 255),
        (128, 0, 0), (0, 128, 0), (0, 0, 128),
        (128, 128, 0), (0, 128, 128), (128, 0, 128)
    ]
    return palette[class_id % len(palette)]


def annotate_frame(frame, results):
    for bbox in results.xyxy[0].numpy():
        x1, y1, x2, y2, conf, cls = bbox
        label = f"{results.names[int(cls)]} {conf:.2f}"
        color = get_color(int(cls))
        cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
        cv2.putText(frame, label, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
    return frame


async def main():
    await process_local_camera()


if __name__ == "__main__":
    asyncio.run(main())
