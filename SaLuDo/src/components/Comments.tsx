import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { commentsApi } from "../utils/api";
import {
  Comment,
  CommentEntityType,
  CreateCommentData,
  MentionUser,
} from "../types/comment";
import "./css/Comments.css";

interface CommentsProps {
  entityType: CommentEntityType;
  entityId: string;
}

const Comments: React.FC<CommentsProps> = ({ entityType, entityId }) => {
  const { accessToken, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<{ [key: string]: Comment[] }>({});
  const [loadingReplies, setLoadingReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [checkedForReplies, setCheckedForReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [showReplies, setShowReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Mention autocomplete state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
  }, [entityType, entityId, page]);

  const loadComments = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await commentsApi.getTopLevelComments(
        accessToken,
        entityType,
        entityId,
        {
          page,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
        }
      );

      if (response.success) {
        setComments(response.data.comments);
        setHasMore(response.data.pagination.hasNextPage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  // Load replies for a specific comment
  const loadReplies = async (commentId: string) => {
    if (!accessToken) return;

    // If already checked, just toggle visibility
    if (checkedForReplies[commentId]) {
      setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
      return;
    }

    // If already loading, skip
    if (loadingReplies[commentId]) return;

    try {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
      const response = await commentsApi.getReplies(accessToken, commentId);
      if (response.success) {
        setReplies((prev) => ({ ...prev, [commentId]: response.data || [] }));
        setCheckedForReplies((prev) => ({ ...prev, [commentId]: true }));
        setShowReplies((prev) => ({ ...prev, [commentId]: true }));
      }
    } catch (err) {
      console.error("Failed to load replies:", err);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Fetch users for mention autocomplete
  const searchMentionUsers = async (query: string) => {
    if (!accessToken || query.length < 3) return;

    console.log('🔍 Searching for users with query:', query);
    try {
      setMentionLoading(true);
      const response = await commentsApi.searchUsers(accessToken, query);
      console.log('✅ Search response:', response);
      if (response.success) {
        setMentionUsers(response.data || []);
        console.log('👥 Found users:', response.data?.length || 0);
      }
    } catch (err) {
      console.error("❌ Failed to search users:", err);
    } finally {
      setMentionLoading(false);
    }
  };

  // Handle text input change and detect @ mentions
  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    isNewComment: boolean = true
  ) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;

    if (isNewComment) {
      setNewComment(text);
    } else {
      setEditText(text);
    }

    setCursorPosition(cursorPos);

    // Check if user is typing a mention - allow letters, dots, and @ for email
    const textBeforeCursor = text.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([\w.@]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      console.log('📝 Mention detected! Query:', query, 'Length:', query.length);
      setMentionQuery(query);
      setShowMentions(true);
      setSelectedMentionIndex(0);
      if (query.length >= 3) {
        console.log('🚀 Triggering search for:', query);
        searchMentionUsers(query);
      } else {
        console.log('⏸️ Query too short, need 3+ chars');
        setMentionUsers([]);
      }
    } else {
      setShowMentions(false);
      setMentionUsers([]);
    }
  };

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    isNewComment: boolean = true
  ) => {
    if (!showMentions || mentionUsers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedMentionIndex((prev) =>
        prev < mentionUsers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      insertMention(mentionUsers[selectedMentionIndex], isNewComment);
    } else if (e.key === "Escape") {
      setShowMentions(false);
      setMentionUsers([]);
    }
  };

  // Insert selected mention into text
  const insertMention = (
    mentionUser: MentionUser,
    isNewComment: boolean = true
  ) => {
    const text = isNewComment ? newComment : editText;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const textAfterCursor = text.substring(cursorPosition);

    // Use email as mention format (no spacing issues)
    const mentionText = mentionUser.email;
    // Replace @query with @email
    const newText =
      textBeforeCursor.replace(/@[\w.@]*$/, `@${mentionText} `) +
      textAfterCursor;

    if (isNewComment) {
      setNewComment(newText);
    } else {
      setEditText(newText);
    }

    setShowMentions(false);
    setMentionUsers([]);

    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = textBeforeCursor.replace(
        /@[\w.@]*$/,
        `@${mentionText} `
      ).length;
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newComment.trim()) return;

    const parentId = replyTo;

    try {
      const commentData: CreateCommentData = {
        text: newComment,
        entityType,
        entityId,
        parentCommentId: replyTo,
      };

      const response = await commentsApi.createComment(
        accessToken,
        commentData
      );

      if (response.success) {
        setNewComment("");
        setReplyTo(null);

        if (parentId) {
          // If this was a reply, reload replies for the parent comment
          setReplies((prev) => {
            const updated = { ...prev };
            delete updated[parentId];
            return updated;
          });
          await loadReplies(parentId);
        } else {
          // If top-level comment, reload all comments
          loadComments();
        }
      }
    } catch (err) {
      console.error("Failed to create comment:", err);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!accessToken || !editText.trim()) return;

    try {
      const response = await commentsApi.updateComment(
        accessToken,
        commentId,
        editText
      );

      if (response.success) {
        setEditingComment(null);
        setEditText("");
        loadComments();
      }
    } catch (err) {
      console.error("Failed to update comment:", err);
      alert("Failed to update comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!accessToken) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await commentsApi.deleteComment(accessToken, commentId);

      if (response.success) {
        loadComments();
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.commentId);
    setEditText(comment.text);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditText("");
  };

  const startReply = (commentId: string) => {
    setReplyTo(commentId);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, level: number = 0) => {
    const isAuthor = user?.userId === comment.authorId;
    const isEditing = editingComment === comment.commentId;
    const isReplyingTo = replyTo === comment.commentId;
    const commentReplies = replies[comment.commentId] || [];
    const hasReplies = commentReplies.length > 0;
    const isLoadingReplies = loadingReplies[comment.commentId];

    return (
      <div
        key={comment.commentId}
        className={`comment ${level > 0 ? "comment-reply" : ""}`}
        style={{ marginLeft: level > 0 ? "2rem" : "0" }}
      >
        <div className="comment-header">
          <div className="comment-author">
            <div className="author-avatar">
              {comment.authorName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <strong>{comment.authorName}</strong>
              <span className="comment-time">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && <span className="edited-badge">Edited</span>}
            </div>
          </div>
          {isAuthor && !comment.isDeleted && (
            <div className="comment-actions">
              <button
                onClick={() => startEditing(comment)}
                className="btn-edit"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteComment(comment.commentId)}
                className="btn-delete"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="comment-body">
          {comment.isDeleted ? (
            <p className="deleted-text">[Comment deleted]</p>
          ) : isEditing ? (
            <div className="edit-form">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="comment-textarea"
              />
              <div className="edit-actions">
                <button
                  onClick={() => handleUpdateComment(comment.commentId)}
                  className="btn-save"
                >
                  Save
                </button>
                <button onClick={cancelEditing} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="comment-text">{comment.text}</p>
              <div className="comment-footer-actions">
                {!comment.isDeleted && (
                  <button
                    onClick={() => startReply(comment.commentId)}
                    className="btn-reply"
                  >
                    Reply
                  </button>
                )}
                {!isLoadingReplies &&
                  (!checkedForReplies[comment.commentId] || hasReplies) && (
                    <button
                      onClick={() => loadReplies(comment.commentId)}
                      className="btn-show-replies"
                    >
                      {showReplies[comment.commentId]
                        ? "Hide Replies"
                        : "Show Replies"}
                    </button>
                  )}
                {isLoadingReplies && (
                  <span className="loading-replies">Loading replies...</span>
                )}
              </div>
            </>
          )}
        </div>

        {isReplyingTo && (
          <div className="reply-form">
            <form onSubmit={handleSubmitComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Reply to ${comment.authorName}...`}
                className="comment-textarea"
              />
              <div className="reply-actions">
                <button type="submit" className="btn-post">
                  Post Reply
                </button>
                <button
                  type="button"
                  onClick={cancelReply}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Render replies */}
        {checkedForReplies[comment.commentId] &&
          showReplies[comment.commentId] && (
            <div className="replies-container">
              {commentReplies.length > 0 ? (
                commentReplies.map((reply) => renderComment(reply, level + 1))
              ) : (
                <div className="no-replies-message">No replies yet</div>
              )}
            </div>
          )}
      </div>
    );
  };

  if (loading && page === 1) {
    return <div className="comments-loading">Loading comments...</div>;
  }

  return (
    <div className="comments-section">
      <h3 className="comments-header">Comments ({comments.length})</h3>

      {error && <div className="comments-error">{error}</div>}

      {/* New Comment Form */}
      {!replyTo && (
        <form onSubmit={handleSubmitComment} className="new-comment-form">
          <div className="textarea-container">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => handleTextChange(e, true)}
              onKeyDown={(e) => handleKeyDown(e, true)}
              placeholder="Write a comment... (Use @email to mention someone - min 3 chars)"
              className="comment-textarea"
              rows={3}
            />
            {showMentions && mentionUsers.length > 0 && (
              <div ref={mentionDropdownRef} className="mention-dropdown">
                {mentionLoading && (
                  <div className="mention-loading">Loading...</div>
                )}
                {!mentionLoading &&
                  mentionUsers.map((mentionUser, index) => (
                    <div
                      key={mentionUser.userId}
                      className={`mention-item ${
                        index === selectedMentionIndex ? "selected" : ""
                      }`}
                      onClick={() => insertMention(mentionUser, true)}
                      onMouseEnter={() => setSelectedMentionIndex(index)}
                    >
                      <div className="mention-avatar">
                        {mentionUser.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="mention-info">
                        <div className="mention-username">
                          {mentionUser.username}
                        </div>
                        <div className="mention-details">
                          {mentionUser.email} • {mentionUser.role}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="btn-post"
          >
            Post Comment
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.map((comment) => renderComment(comment))}

        {comments.length === 0 && !loading && (
          <p className="no-comments">
            No comments yet. Be the first to comment!
          </p>
        )}

        {hasMore && (
          <button
            onClick={() => setPage(page + 1)}
            className="btn-load-more"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Comments;
