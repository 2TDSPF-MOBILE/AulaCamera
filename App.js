import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';

//Novo sistema de câmeras no Expo SDK 51+
import { CameraView, useCameraPermissions } from 'expo-camera';

//Biblioteca para salvar a foto na galeria
import * as MediaLibrary from 'expo-media-library'

export default function App() {
  //Estado para permissão da camera
  const [permissaoCam, requestPermissaoCam] = useCameraPermissions()

  //Estado para permissão da galeria
  const [permissaoMedia, requestPermissaoMedia] = MediaLibrary.usePermissions()

  //Referência da câmera (acesso direto ao componente)
  const cameraRef = useRef(null)

  //Estado para a foto capturado
  const [foto, setFoto] = useState(null)

  //Solicitar permissão para acessar a galeria no inicio do app
  useEffect(() => {
    if (permissaoMedia === null) return;
    if (!permissaoMedia?.granted) {
      requestPermissaoMedia()
    }
  }, [])

  //Função para tirar foto
  const tirarFoto = async () => {
    if (cameraRef.current) {
      const dadoFoto = await cameraRef.current.takePictureAsync(); //captura foto
      setFoto(dadoFoto)//Salva Estado
    }
  }

  const salvarFoto = async () => {
    try {
      await MediaLibrary.createAssetAsync(foto.uri)//Salvar a foto na galeria
      Alert.alert("Sucesso", "Foto salva com suceso!")
      setFoto(null) //Reseta o estado para eu tirar uma foto
    } catch (err) {
      Alert.alert("Error", "Error ao Salvar Foto.")
    }
  }

  //Enquanto a permissão não estiver carregada
  if (!permissaoCam) return <View />

  if (!permissaoCam.granted) {
    return (
      <View>
        <Text>Permissão da câmera não foi concedida</Text>
        <Button title='Permitir' onPress={requestPermissaoCam} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {!foto?(
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing='back'
          />
          <Button title='Titar Foto' onPress={tirarFoto} />
        </>
      ):(
        <>
          <Image source={{uri:foto.uri}} style={styles.preview}/>
          <Button title='Tirar nova foto' onPress={()=>setFoto(null)}/>
          <Button title='Salvar Foto' onPress={salvarFoto} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  camera: {
    flex: 1
  },
  preview:{
    flex:1
  }
});
