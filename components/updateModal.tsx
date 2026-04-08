import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import CustomModal from './CustomModal';

interface UpdateModalProps {
  visible: boolean;
  onDownload: () => void;
  onCancel: () => void;
  isDownloading: boolean;
}

export default function UpdateModal({
  visible,
  onDownload,
  onCancel,
  isDownloading,
}: UpdateModalProps) {
  return (
    <CustomModal
      visible={visible}
      onClose={onCancel}
      title="Update Available"
      showCloseButton={!isDownloading}
    >
      <View className="items-center">
        {isDownloading ? (
          <>
            <ActivityIndicator size="large" color="#0000ff" className="mb-4" />
            <Text className="text-base text-gray-700">
              Downloading update...
            </Text>
          </>
        ) : (
          <>
            <Text className="text-base text-gray-700 mb-6 text-center">
              A new update is available. Download now to get the latest features
              and improvements!
            </Text>
            <View className="flex-row justify-around w-full">
              <Pressable onPress={onCancel} className="flex-1 mx-2">
                Cancel
              </Pressable>
              <Pressable onPress={onDownload} className="flex-1 mx-2">
                Download
              </Pressable>
            </View>
          </>
        )}
      </View>
    </CustomModal>
  );
}
