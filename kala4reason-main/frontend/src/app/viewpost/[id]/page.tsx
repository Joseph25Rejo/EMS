'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_BASE = "https://thecodeworks.in/kalarasa";

interface Creator {
  address: string;
  age: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  state: string;
  verified: boolean;
}

interface Comment {
  author: string;
  text: string;
  createdAt?: string;
}

interface Post {
  _id: string;
  comments: Comment[];
  creator: Creator;
  description: string;
  images: string[];
  likes: number;
  tags: string[];
  title: string;
  createdAt: string;
}

export default function ViewPost() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      try {
        const user = JSON.parse(userData);
        setUserEmail(user.email);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      router.push('/login');
      return;
    }

    fetchPost();
  }, [postId, router]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/fetch_post/${postId}`);
      if (!res.ok) throw new Error('Failed to fetch post');
      const data = await res.json();
      setPost(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLike = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/add_like/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setHasLiked(!hasLiked);
        // Update likes count immediately for better UX
        setPost(prev => prev ? {
          ...prev,
          likes: hasLiked ? prev.likes - 1 : prev.likes + 1
        } : null);
      }
    } catch (err) {
      console.error('Error adding like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || !userEmail) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setIsCommenting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/add_comment/${postId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          author: userEmail,
          text: commentText
        })
      });
      if (res.ok) {
        const newComment = {
          author: userEmail,
          text: commentText,
          createdAt: new Date().toISOString()
        };
        
        // Update comments immediately for better UX
        setPost(prev => prev ? {
          ...prev,
          comments: [...prev.comments, newComment]
        } : null);
        
        setCommentText('');
      } else {
        const errorData = await res.json();
        console.error('Error adding comment:', errorData);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsCommenting(false);
    }
  };

  const deletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/delete_post/${postId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        router.push('/'); // Redirect to home page
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md mx-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-4">The requested post could not be found.</p>
          <Link 
            href="/"
            className="inline-block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = userEmail && post.creator.email === userEmail;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">{post.creator.first_name} {post.creator.last_name}</span>
                  {post.creator.verified && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex items-center">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* Post Image */}
          <div className="w-full bg-gray-100">
            {post.images && post.images.length > 0 ? (
              <img 
                src={`${API_BASE}/${post.images[0]}`} 
                alt={post.title}
                className="w-full max-h-[600px] object-contain mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
          
          {/* Post Actions */}
          <div className="p-4 border-b flex items-center space-x-6">
            <button 
              onClick={addLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 ${hasLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}
            >
              <Heart className="w-6 h-6" fill={hasLiked ? 'currentColor' : 'none'} />
              <span>{post.likes}</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-500">
              <MessageSquare className="w-6 h-6" />
              <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
          
          {/* Post Description */}
          <div className="p-6">
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">{post.description}</p>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Comments Section */}
          <div className="border-t p-6">
            <h3 className="text-lg font-semibold mb-4">
              Comments {post.comments.length > 0 && `(${post.comments.length})`}
            </h3>
            
            {/* Add Comment */}
            <div className="mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={addComment}
                      disabled={!commentText.trim() || isCommenting}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        commentText.trim() 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isCommenting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments List */}
            <div className="space-y-4">
              {post.comments.length > 0 ? (
                post.comments.map((comment, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {comment.author ? comment.author.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-900 truncate">
                            {comment.author || 'Anonymous'}
                          </p>
                          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}