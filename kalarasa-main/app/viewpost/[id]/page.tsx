'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Trash2 } from 'lucide-react';
import Navbar from '../../../components/navbar';

const API_BASE = "https://thecodeworks.in/kalarasa";

interface Creator {
  address: string;
  age: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  state: string;
}

interface Comment {
  author: string;
  text: string;
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
}

export default function ViewPost() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    // Get user email from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserEmail(user.email);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    fetchPost();
  }, [postId]);

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
    try {
      const res = await fetch(`${API_BASE}/add_like/${postId}`, {
        method: "POST"
      });
      if (res.ok) {
        setHasLiked(true);
        // Refresh post data to get updated likes count
        fetchPost();
      }
    } catch (err) {
      console.error('Error adding like:', err);
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || !userEmail) return;
    
    try {
      const res = await fetch(`${API_BASE}/add_comment/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: userEmail,
          text: commentText
        })
      });
      if (res.ok) {
        setCommentText('');
        // Refresh post data to get updated comments
        fetchPost();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-xl">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-teal-300 to-cyan-300 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-800">Connect with art. Support the artist.</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-xl text-red-600">Error: {error || 'Post not found'}</p>
        </div>
      </div>
    );
  }

  const isOwner = userEmail && post.creator.email === userEmail;

  return (
    <>
    <head>
            <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          </head>
          <div className="bg-white relative w-full">
            <Navbar />
            
            {/* Green Background Section */}
            <div 
              className="absolute left-0 w-full h-[200px] overflow-hidden" 
              style={{ backgroundColor: '#93E3E6' }}
            >
              <div className="relative w-full h-full">
                {/* Left Text */}
                <div className="absolute left-[50px] top-1/2 transform -translate-y-1/2 max-w-[500px] z-10">
                  <h2 className="font-['Instrument_Serif'] text-5xl leading-tight text-black">
                    Connect with Art. Support the <br />
                    Artist.
                  </h2>
                </div>
    
                {/* Right SVG */}
                <div className="absolute right-[20px] top-1/2 transform -translate-y-[40%] z-0">
                  <img 
                    src="/right.svg" 
                    alt="Decoration" 
                    className="h-[900px] w-[900px]"
                    onLoad={() => console.log('Image loaded successfully')}
                    onError={(e) => console.error('Image failed to load:', e)}
                  />
                </div>
              </div>
            </div>

      {/* View Post Title */}
      <div className="font-['Inter'] mt-[240px] px-10 py-6">
        <h2 className="text-3xl font-semibold mb-8">View Post</h2>
      </div>

      {/* Main Post Content */}
      <div className="mx-8 px-4 mb-12">
        <div className="border-1 border-gray-400 rounded-lg p-8">
          {/* Post Title and Author */}
          <div className="mb-6">
            <h1 className="font-['Instrument_Serif'] text-3xl font-bold mb-2">{post.title}</h1>
            <p className="font-['Instrument_Serif'] text-xl text-gray-700">by {post.creator.first_name} {post.creator.last_name}</p>
          </div>

          {/* Post Image */}
          {post.images && post.images.length > 0 && (
            <div className="mb-6 flex justify-center">
              <img 
                src={`${API_BASE}/uploads/${post.images[0].split("/").pop()}`}
                alt={post.title}
                className="max-w-full max-h-96 object-contain rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Post Description */}
          <div className="mb-8">
            <p className="text-lg text-gray-800 leading-relaxed">{post.description}</p>
          </div>

          {/* Like Button and Count */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={addLike}
              disabled={hasLiked}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                hasLiked 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-700 hover:bg-red-800'
              }`}
            >
              <Heart className="w-5 h-5" />
              {hasLiked ? 'Liked' : 'Like Post'}
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              <span className="text-2xl font-bold">{post.likes}</span>
            </div>

            {/* Delete Button (only for owner) */}
            {isOwner && (
              <button 
                onClick={deletePost}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors ml-auto"
              >
                <Trash2 className="w-5 h-5" />
                Delete Post
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t-2 border-gray-200 pt-8">
            <h3 className="text-2xl font-bold mb-6">Comments</h3>
            
            {/* Add Comment */}
            {userEmail && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment!"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 mb-4"
                  rows={3}
                />
                <button 
                  onClick={addComment}
                  disabled={!commentText.trim()}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {post.comments.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No comments yet. Be the first to comment!</p>
              ) : (
                post.comments.map((comment, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white">
                    <div className="font-bold text-lg mb-2">{comment.author}</div>
                    <div className="text-gray-800">{comment.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mx-8 px-4 mb-12">
        <div className="border-1 border-gray-400 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-6">Want to buy artwork or hire artist? Contact here!</h3>
          <div className="grid md:grid-cols-2 gap-4 text-lg">
            <div>
              <p className="font-bold mb-2">{post.creator.first_name} {post.creator.last_name}</p>
              <p className="mb-2">Email: <span className="font-semibold">{post.creator.email}</span></p>
              <p className="mb-2">Phone: <span className="font-semibold">{post.creator.phone}</span></p>
            </div>
            <div>
              <p className="mb-2">Age: <span className="font-semibold">{post.creator.age}</span></p>
              <p className="mb-2">Address: <span className="font-semibold">{post.creator.address}</span></p>
              <p>State: <span className="font-semibold">{post.creator.state}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}