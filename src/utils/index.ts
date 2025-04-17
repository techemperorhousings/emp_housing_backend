import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum AccessLevel {
  ALL = 'ALL',
  ADMIN = 'ADMIN',
  USER = 'USER',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
}
const newFunc = () => {};

export type ACCESS_LEVEL = keyof typeof AccessLevel;

export const PERMISSIONS_ARRAY: Array<{ name: string; access: ACCESS_LEVEL }> =
  [
    { name: 'READ', access: 'ALL' },
    { name: 'WRITE', access: 'ALL' },
    { name: 'DELETE', access: 'ADMIN' },
    { name: 'UPDATE', access: 'ADMIN' },
    { name: 'VIEW', access: 'ALL' },
    { name: 'CREATE', access: 'ADMIN' },
    { name: 'MANAGE', access: 'ADMIN' },
    { name: 'APPROVE', access: 'ADMIN' },
    { name: 'REJECT', access: 'ADMIN' },
    { name: 'UPDATE_PROPERTY', access: 'SELLER' },
    { name: 'BOOK_PROPERTY', access: 'BUYER' },
  ];

export type USER_PERMISSIONS_ARRAY = keyof typeof PERMISSIONS_ARRAY;

export const GET_ROLE_AND_PERMISSIONS = {
  role: {
    select: {
      name: true,
      permissions: {
        select: {
          permission: {
            select: {
              name: true,
              access: true,
            },
          },
        },
      },
    },
  },
};
export const generateMagicLinkToken = (): string => {
  return uuidv4();
};

export const generateRandomHash = (length: number): string => {
  if (length <= 0 || !Number.isInteger(length)) {
    throw new Error('Length must be a positive integer');
  }

  // Determine the number of bytes needed based on the desired length of the hash string
  const numBytes = Math.ceil(length / 2); // Each byte corresponds to 2 hexadecimal characters

  // Generate a secure random buffer of the required length
  const randomBuffer = crypto.randomBytes(numBytes);

  // Convert the random buffer to a hexadecimal string
  const hashString = randomBuffer.toString('hex').slice(0, length);

  return hashString;
};

export const formatPhone = (phone: string) => {
  let phoneNo;

  if (!phone) {
    return;
  }

  if (phone.includes('+234')) {
    return phone;
  }

  phoneNo = phone.replace('+234', '');
  phoneNo = phoneNo.replace('+', '');
  phoneNo = phoneNo.indexOf(0) === 0 ? phoneNo.slice(1) : phoneNo;
  phoneNo = '+234' + phoneNo;

  return phoneNo;
};

export function generateOrderId(length = 12) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let orderId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderId += characters.charAt(randomIndex);

    if ((i + 1) % 4 === 0 && i < length - 1) {
      orderId += '-';
    }
  }

  return orderId;
}

export function randomstring(L: number) {
  let s = '';
  const randomchar = function () {
    const n = Math.floor(Math.random() * 26); // Generate a random number between 0 and 25
    return String.fromCharCode(n + 65); // Convert to uppercase letter (A-Z)
  };
  while (s.length < L) s += randomchar();
  return s;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100; // Distance in km
}
