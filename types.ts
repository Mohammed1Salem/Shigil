export type RootStackParamList = {
    RoleSelection: undefined;
    ProfessionalAuth: undefined;
    RegularAuth: undefined;
    Main: undefined;
    WorkersPage: undefined;
    Talabaty: undefined;
    Home: undefined;


    WorkerDetails: { profession: string };

  };
  
  declare global {
    namespace ReactNavigation {
      interface RootParamList extends RootStackParamList {}
    }
  }