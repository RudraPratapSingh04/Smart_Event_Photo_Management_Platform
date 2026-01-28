import torch
from torchvision import models, transforms
from PIL import Image

model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
model.eval()
labels = models.ResNet50_Weights.DEFAULT.meta["categories"]
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])
def predict_tags(image: Image.Image, top_k=5):
    input_tensor = preprocess(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.nn.functional.softmax(outputs[0], dim=0)

    top_probs, top_idxs = probs.topk(top_k)
    tags = [labels[idx] for idx in top_idxs.tolist()]
    return tags