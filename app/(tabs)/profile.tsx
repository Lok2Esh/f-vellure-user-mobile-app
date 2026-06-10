import { View, Text } from 'react-native';
import { Heading, Center } from '@gluestack-ui/themed';

export default function ProfileScreen() {
  return (
    <Center className="flex-1 bg-background">
      <Heading className="text-primary">Profile</Heading>
      <Text className="text-gray-500 mt-2">Manage your preferences</Text>
    </Center>
  );
}
