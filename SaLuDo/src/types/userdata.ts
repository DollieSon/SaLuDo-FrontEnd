/**
 * Represents the user data structure.
 *
 * @property name - The full name of the user.
 * @property age - The age of the user.
 * @property email - The email address of the user.
 * @property [address] - The optional address of the user.
 * @property [resume] - An optional file representing the user's resume, or null if not provided.
 */
export interface UserData {
  name: string
  age: number
  email: string
  address?: string
  resume?: File | null
}