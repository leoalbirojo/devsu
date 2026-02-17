import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const HeaderTitle = () => (
  <View style={styles.headerTitleContainer}>
    <Text style={styles.headerIcon}></Text>
    <Text style={styles.headerText}>BANCO</Text>
  </View>
);

function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ 
                headerTitle: () => <HeaderTitle />,
                headerTitleAlign: 'center'
              }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ 
                headerTitle: () => <HeaderTitle />,
                headerTitleAlign: 'center'
              }}
            />
            <Stack.Screen
              name="EditProduct"
              component={EditProductScreen}
              options={{ 
                headerTitle: () => <HeaderTitle />,
                headerTitleAlign: 'center'
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1b18',
  },
});

export default App;
