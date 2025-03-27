import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MainOptionsBar from "./MainOptionsBar";
import RoleSelectionScreen from "./RoleSelectionScreen";
import ProfessionalAuth from "./ProfessionalAuth";
import RegularAuth from "./RegularAuth";
import WorkersPage from "./WorkersPage";
import WorkerDetailsScreen from './WorkerDetailsScreen'; // أعلى الملف


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelection">
        <Stack.Screen
          name="RoleSelection"
          component={RoleSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfessionalAuth"
          component={ProfessionalAuth}
          options={{ title: "Professional Auth" }}
        />
        <Stack.Screen
          name="RegularAuth"
          component={RegularAuth}
          options={{ title: "Regular Auth" }}
        />
        <Stack.Screen
          name="Main"
          component={MainOptionsBar}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WorkersPage"
          component={WorkersPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
  name="WorkerDetails"
  component={WorkerDetailsScreen}
  options={{ title: 'تفاصيل الشغيل' }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
