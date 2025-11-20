export interface Account {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  encryptedToken: string;
  deviceId: string;
  createdAt: string;
  lastLogin: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Session {
  accountId: string;
  deviceId: string;
  startedAt: string;
}
