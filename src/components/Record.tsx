import Voice, {SpeechResultsEvent} from '@react-native-voice/voice';
import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {postSttText} from '../apis/poststttext';
import {getStorage} from '../utils/asyncstorage';

interface Props {
  prevAnswer: string;
  prevBase64Img: string;
  setPrevAnswer: React.Dispatch<React.SetStateAction<string>>;
}

export default function Record({
  prevAnswer,
  prevBase64Img,
  setPrevAnswer,
}: Props): React.JSX.Element {
  const [recordFlag, setRecordFlag] = useState<boolean | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [displayMode, setDisplayMode] = useState<string>('');
  const [ttsSpeed, setTtsSpeed] = useState<string>('');

  const viewStyle = recordFlag ? 'bg-red-500' : '';
  const accessibility = recordFlag ? '녹음 종료 버튼' : '녹음 시작 버튼';

  const handleClickBtn = () => {
    if (recordFlag === null) {
      setRecordFlag(true);
    } else {
      setRecordFlag(prev => !prev);
    }
  };

  // 음성 인식 모듈 마운트
  useEffect(() => {
    console.log('음성 인식 모듈 마운트');
    const onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        setRecognizedText(e.value[0]);
      }
    };
    Voice.onSpeechResults = onSpeechResults;

    getStorage('displayMode').then(value => {
      if (value !== null) {
        setDisplayMode(value);
        console.log('displayMode 업뎃 완료');
      }
    });

    getStorage('ttsSpeed').then(value => {
      if (value !== null) {
        setTtsSpeed(value);
        console.log('ttsSpeed 업뎃 완료');
      }
    });

    return () => {
      console.log('음성 인식 모듈 언마운트');
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // 상태에 따라 stt 로직 구현
  useEffect(() => {
    const handleStt = () => {
      // 초기 로딩이거나 다른 페이지로 이동했다면 early return
      if (recordFlag === null) {
        return;
      }
      // 음성 인식 시작 버튼 클릭 시
      if (recordFlag) {
        setRecognizedText('');
        Voice.start('ko-KR')
          .then(() => {
            console.log('음성 인식 시작');
          })
          .catch(error => {
            console.log('음성 인식 에러', error);
          });
        // 음성 인식 종료 버튼 클릭 시
      } else if (!recordFlag) {
        Voice.stop()
          .then(() => {
            console.log('음성 인식 종료');
            postSttText({
              reqText: recognizedText,
              prevAnswer: prevAnswer,
              prevBase64Img: prevBase64Img,
              setPrevAnswer: setPrevAnswer,
              displayMode: displayMode,
              ttsSpeed: ttsSpeed,
            });
          })
          .catch(error => {
            console.log('녹음 종료 도중 문제 발생', error);
          });
      }
    };
    handleStt();
  }, [recordFlag]);

  return (
    <View className="w-20 h-20 relative flex justify-center items-center">
      <View className="w-full h-full rounded-full absolute bottom-0.5 left-0.5 flex justify-center items-center">
        <TouchableOpacity
          className="w-5/6 h-5/6 rounded-full bg-custom-white flex justify-center items-center"
          onPress={handleClickBtn}
          accessible={true}
          accessibilityLabel={accessibility}>
          <View
            className={`w-1/3 h-1/3 rounded-full border-2 border-red-500 ${viewStyle}`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
