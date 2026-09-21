export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  BugDetail: { bugId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  NewBug: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type BugStackParamList = {
  BugList: undefined;
  BugDetail: { bugId: string };
};
