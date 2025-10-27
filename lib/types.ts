// Core Types
export type Quadrant = 'q1' | 'q2' | 'q3' | 'q4'

export interface Task {
  id: string
  title: string
  notes: string
  due: string | null  // ISO 8601
  createdAt: string   // ISO 8601
  priority?: number   // AI算出優先度 (0-100)
  aiReason?: string   // AI判定理由
}

export interface Board {
  id: string
  title: string
  editKey: string
  updatedAt: number   // Unix timestamp
  tasks: {
    q1: Task[]
    q2: Task[]
    q3: Task[]
    q4: Task[]
  }
}

export interface User {
  sub: string  // Cognito User ID
  email: string
  createdAt: number
  entitlements: {
    pro: boolean
    lifetime: boolean
    proUntil: number | null
  }
}

export interface Payment {
  sub: string
  type: 'monthly' | 'lifetime'
  amount: number
  currency: 'jpy'
  createdAt: number
  stripeSessionId: string
  status: 'succeeded' | 'pending' | 'failed'
}

export interface BrainstormResult {
  title: string
  notes: string
  importance: number  // 0-100
  urgency: number     // 0-100
  reason: string
  quadrant: Quadrant
  suggestedDue?: string
}

// DynamoDB Item Types
export interface DynamoDBBoardMetadata {
  PK: `BOARD#${string}`
  SK: 'METADATA'
  GSI1PK: string  // editKey
  GSI1SK: 'METADATA'
  entityType: 'BOARD'
  title: string
  editKey: string
  updatedAt: number
}

export interface DynamoDBTask {
  PK: `BOARD#${string}`
  SK: `TASK#${string}#${Quadrant}`
  entityType: 'TASK'
  taskId: string
  quadrant: Quadrant
  taskTitle: string
  notes: string
  due: string | null
  createdAt: string
}

export interface DynamoDBUserMetadata {
  PK: `USER#${string}`
  SK: 'METADATA'
  entityType: 'USER'
  sub: string
  email: string
  createdAt: number
  entitlements: {
    pro: boolean
    lifetime: boolean
    proUntil: number | null
  }
}

export interface DynamoDBPayment {
  PK: `USER#${string}`
  SK: `PAYMENT#${string}`
  entityType: 'PAYMENT'
  paymentId: string
  sub: string
  type: 'monthly' | 'lifetime'
  amount: number
  currency: 'jpy'
  createdAt: number
  stripeSessionId: string
  status: 'succeeded' | 'pending' | 'failed'
}
