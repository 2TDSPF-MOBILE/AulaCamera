import { StyleSheet, Text, View, Image, Button, Alert, Linking } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';


//Novo sistema de câmeras no Expo SDK 51+
import { CameraView, useCameraPermissions } from 'expo-camera';

//Biblioteca para salvar a foto na galeria
import * as MediaLibrary from 'expo-media-library'

//Importanto modulo para compartilhamento externo
import * as Sharing from 'expo-sharing'

export default function App() {
  //Estado para permissão da camera
  const [permissaoCam, requestPermissaoCam] = useCameraPermissions()

  //Estado para permissão da galeria
  const [permissaoMedia, requestPermissaoMedia] = MediaLibrary.usePermissions()

  //Referência da câmera (acesso direto ao componente)
  const cameraRef = useRef(null)

  //Estado para a foto capturado
  const [foto, setFoto] = useState(null)

  // Estado para alterar camera frontal e camera traseira
  const[isFrontCamera,setIsFrontCamera]=useState(false)

  //Estado para o flash do aparelho
  const[flashLigado,setFlashLigado] = useState(false)

  //Criando o estado escaneado
  const[scaneado,setScaneado]=useState(false)

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

  const compartilharFoto = async () =>{
    if(foto?.uri && await Sharing.isAvailableAsync()){
      await Sharing.shareAsync(foto.uri)
    }else{
      Alert.alert("Error","Não foi possível o compartilhamento")
    }
  }


  //Função para alterar as cameras
  const alterarCamera = () =>{
    setIsFrontCamera((value)=>!value)
  }

  //Função para ligar ou desligar o flash
  const alterarFlash = () =>{
    setFlashLigado((value)=>!value)
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
            facing={isFrontCamera?'front':'back'}
            flash={flashLigado?'on':'off'}
            onBarcodeScanned={({type,data})=>{
              if(!scaneado){
                setScaneado(true)
                Alert.alert("Cod Detectado", `Tipo:${type}\nValor:${data}`,
                  [{text:"Cancelar", style:'cancel'},
                    {text:"Pesquisar Produto",onPress:()=>{
                      const url = `https://pt.product-search.net/?q=${data}`;
                      Linking.openURL(url)
                    }}]
                )
              }
            }}
          />
          <Button title='Tirar Foto' onPress={tirarFoto} />
          <Button title='Alterar Camera' onPress={alterarCamera}/>
          <Button title={flashLigado?'Desligar flash':'Ligar flash'} onPress={alterarFlash}/>
          {scaneado && (
            <Button title='Escanear novamente' onPress={()=>setScaneado(false)}/>
          )}
        </>
      ):(
        <>
          <Image source={{uri:foto.uri}} style={styles.preview}/>
          <Button title='Tirar nova foto' onPress={()=>setFoto(null)}/>
          <Button title='Salvar Foto' onPress={salvarFoto} />
          <Button title='Compartilhar foto' onPress={compartilharFoto}/>
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
