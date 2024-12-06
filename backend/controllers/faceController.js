export const validateFace = async (req, res) => {
    try {
      const { imageBuffer, storedDescriptor } = req.body;
  
      const detectedDescriptor = await detectFace(imageBuffer);
  
      const distance = faceapi.euclideanDistance(detectedDescriptor, storedDescriptor);
  
      if (distance > 0.6) {
        return res.status(400).json({ message: "Face does not match." });
      }
  
      res.status(200).json({ message: "Face validated successfully" });
    } catch (error) {
      console.error("Error validating face:", error);
      res.status(500).json({ error: "Face validation failed." });
    }
  };
  