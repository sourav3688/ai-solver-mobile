import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const [capturedPhoto, setCapturedPhoto] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const API_URL = "http://192.168.0.199:8000/solve";

  if (!permission) return <View />;
  if (!permission.granted) {
    requestPermission();
    return <View />;
  }

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
    });

    setCapturedPhoto(photo);
    sendToBackend(photo);
  };

  const sendToBackend = async (photo: any) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", {
        uri: photo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const reset = () => {
    setCapturedPhoto(null);
    setResult(null);
  };

  return (
    <View style={styles.container}>
      {!capturedPhoto ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          ref={cameraRef}
        />
      ) : (
        <Image
          source={{ uri: capturedPhoto.uri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      )}

      {/* Result Overlay */}
      <View style={styles.resultOverlay}>
        {loading && <ActivityIndicator size="large" color="white" />}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.answer}>{result.answer}</Text>
            <Text style={styles.explanation}>{result.explanation}</Text>
          </View>
        )}
      </View>

      {/* Capture Button */}
      <View
        style={[
          styles.buttonContainer,
          isLandscape ? styles.landscapeButton : styles.portraitButton,
        ]}
      >
        {!capturedPhoto ? (
          <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
            <Text style={styles.btnText}>Capture</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.retakeBtn} onPress={reset}>
            <Text style={styles.btnText}>Retake</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  resultOverlay: {
    position: "absolute",
    bottom: 120,
    width: "100%",
    alignItems: "center",
  },

  resultCard: {
    backgroundColor: "rgba(0,0,0,0.75)",
    padding: 20,
    borderRadius: 20,
    width: "85%",
  },

  answer: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#00FFAA",
  },

  explanation: {
    color: "white",
    marginTop: 10,
  },

  buttonContainer: {
    position: "absolute",
  },

  portraitButton: {
    bottom: 40,
    alignSelf: "center",
  },

  landscapeButton: {
    right: 30,
    top: "45%",
  },

  captureBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
  },

  retakeBtn: {
    backgroundColor: "#D50000",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});