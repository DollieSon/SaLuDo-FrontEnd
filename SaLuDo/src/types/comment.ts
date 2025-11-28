export enum CommentEntityType {
  CANDIDATE = "CANDIDATE",
  JOB = "JOB",
}

export interface Comment {
  commentId: string;
  text: string;
  authorId: string;
  authorName: string;
  entityType: CommentEntityType;
  entityId: string;
  parentCommentId: string | null;
  mentions: string[];
  isEdited: boolean;
  editedBy?: string;
  editedByName?: string;
  editedAt?: string;
  isDeleted: boolean;
  deletedBy?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  text: string;
  entityType: CommentEntityType;
  entityId: string;
  parentCommentId?: string | null;
}

export interface CommentsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CommentsResponse {
  success: boolean;
  data: {
    comments: Comment[];
    pagination: CommentsPagination;
  };
}

export interface CommentStats {
  totalComments: number;
  totalTopLevel: number;
  totalReplies: number;
  uniqueAuthors: number;
  recentActivity: string | null;
}

export interface MentionUser {
  userId: string;
  username: string;
  email: string;
  title?: string;
  role: string;
  mentionFormats: string[];
}
