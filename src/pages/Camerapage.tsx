import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import PermissionComponent from '../components/Permissioncomp';
import NocamComponent from '../components/Nocamcomp';
import Shutter from '../components/Shutter';
import {useCameraShot} from '../hooks/usecamerashot';
import LoadingSpinner from '../components/Loadingspinner';
import {useRecord} from '../hooks/userecord';
import ResultModal from '../components/Resultmodal';

export default function CameraPage(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const isCamPageActive = useIsFocused();
  const camDevice = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const photoFormat = useCameraFormat(camDevice, [
    {photoResolution: {width: 720, height: 480}},
  ]);
  const camRef = useRef<Camera>(null);

  // 사진 촬영 커스텀 훅
  const {
    answer,
    setAnswer,
    isModalVisible,
    toggleModalState,
    reqBase64Img,
    resBase64Img,
    handleClickShutter,
    resetCamState,
  } = useCameraShot(setIsLoading, camRef);

  // 음성 인식 커스텀 훅
  const {isRecordLoading, recordFlag, toggleRecordFlag, resetSttState} =
    useRecord(answer, setAnswer, reqBase64Img);

  // Focus가 blur 되면 state를 리셋
  useEffect(
    () =>
      navigation.addListener('blur', () => {
        console.log('CameraPage가 blur 되어 state들을 초기화합니다.');
        resetCamState();
        resetSttState();
      }),
    [],
  );

  if (!hasPermission) {
    return <PermissionComponent requestPermission={requestPermission} />;
  } else if (camDevice == undefined) {
    return <NocamComponent />;
  } else {
    return (
      <View className="flex-1 relative">
        {isLoading && <LoadingSpinner isLoading={isLoading} />}
        <Camera
          className="w-full h-full"
          device={camDevice}
          ref={camRef}
          photo={true}
          isActive={isCamPageActive}
          format={photoFormat}
          enableZoomGesture={true}
        />
        <View className="w-full h=1/3 p-4 flex flex-row justify-center items-center absolute bottom-10">
          <Shutter handleClickShutter={handleClickShutter} />
        </View>
        <ResultModal
          isModalVisible={isModalVisible}
          isLoading={isLoading}
          isRecordLoading={isRecordLoading}
          recordFlag={recordFlag}
          reqBase64Img={reqBase64Img}
          resBase64Img={resBase64Img}
          answer={answer}
          toggleModalState={toggleModalState}
          toggleRecordFlag={toggleRecordFlag}
        />
      </View>
    );
  }
}
