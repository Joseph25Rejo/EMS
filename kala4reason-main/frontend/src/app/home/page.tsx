"use client"
import React, { useState, useEffect, useMemo } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import Navbar from '../../components/navbar';

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

interface PostCardProps {
  post: Post;
  index: number;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
}

function PostCard({ post, index, isAuthenticated, isCheckingAuth }: PostCardProps) {
  const router = useRouter();
  const baseUrl = "https://thecodeworks.in/kalarasa";
  const imageUrl = post.images && post.images.length > 0 
    ? `${baseUrl}/${post.images[0]}`
    : null;

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the main content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handlePostClick = () => {
    router.push(`/viewpost/${post._id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the post click
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`${baseUrl}/add_like/${post._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Refresh the posts to show updated like count
        // This would be better with a state management solution
        window.location.reload();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div 
      className="relative bg-white border border-black rounded-[10px] p-4 cursor-pointer hover:shadow-lg transition-shadow" 
      style={{ 
        width: '380px',
        height: '580px'
      }}
      onClick={handlePostClick}
    >
      {/* Image */}
      {imageUrl && (
        <div 
          className="mx-auto mt-8 mb-4 bg-center bg-cover bg-no-repeat rounded-[15px] overflow-hidden" 
          style={{ 
            width: '277px',
            height: '347px',
            backgroundImage: `url('${imageUrl}')`
          }}
        />
      )}
      
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="font-serif text-2xl text-black font-bold leading-tight">{post.title}</h3>
      </div>
      
      {/* Description and Details */}
      <div className="px-4 space-y-2">
        <p className="text-lg text-black line-clamp-2 leading-normal">{post.description}</p>
        <div className="text-base text-gray-600 space-y-1">
          <p>By: {post.creator.first_name} {post.creator.last_name}</p>
          {post.creator.verified && (
            <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-2 py-0.5 rounded-full border border-green-300">
              ✅ Verified
            </span>
          )}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
            >
              ❤️
            </button>
            <span>{post.likes} likes</span>
          </div>
          {post.tags.length > 0 && (
            <p className="text-sm">Tags: {post.tags.join(', ')}</p>
          )}
        </div>
      </div>
      
      {/* View Post Button */}
      <div className="absolute bottom-4 left-4">
        <button 
          className="bg-black hover:bg-gray-800 text-white font-sans text-lg px-6 py-3 rounded-[10px] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handlePostClick();
          }}
        >
          View Post
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'explore'>('discover');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        // No authentication found, redirect to login
        router.push('/login');
        return;
      }
      
      // Authentication found
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      checkAuthentication();
    }
  }, [router]);
  
  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query)) ||
      `${post.creator.first_name} ${post.creator.last_name}`.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  // Define type for art style
  interface ArtStyle {
    name: string;
    state: string;
    description: string;
    image: string;
  }

  // Art styles data with state information
  const artStyles: ArtStyle[] = [
    {
      name: "Karnataka",
      state: "Karnataka",
      description: "The state's artistic heritage blends influences from the Chalukyas, Hoysalas, Vijayanagara rulers, Mysore Wodeyars, and local folk traditions.",
      image: "/karnataka.jpeg"
    },
    {
      name: "Rajasthan",
      state: "Rajasthan",
      description: "Known for vibrant miniature paintings, intricate mirror work, and desert-inspired folk art traditions that reflect royal heritage.",
      image: "/rajasthan.jpeg"
    },
    {
      name: "Kerala",
      state: "Kerala",
      description: "Features unique mural paintings, Kathakali masks, and traditional art forms influenced by coastal culture and spice trade history.",
      image: "/kerala.jpeg"
    },
    {
      name: "West Bengal",
      state: "West Bengal",
      description: "Rich in Pattachitra paintings, terracotta work, and modern artistic movements that blend traditional Bengali culture with contemporary themes.",
      image: "/westbengal.jpeg"
    }
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      // Only fetch posts if user is authenticated
      if (!isAuthenticated) return;
      
      try {
        const response = await fetch("https://thecodeworks.in/kalarasa/retrieve_all_posts");
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Green Background Section */}
      <div className="w-full h-96 bg-[#A2FF9C] relative overflow-hidden">
        <div className="relative w-full h-full">
          {/* Left Text */}
          <div className="absolute left-[50px] top-1/2 transform -translate-y-1/2 max-w-[500px] z-10">
            <h2 className="font-instrument-serif text-5xl leading-tight text-black">
              Discover art from community<br />
              artists all over India.
            </h2>
          </div>

          {/* Right SVG */}
          <div className="absolute right-[20px] top-1/2 transform -translate-y-[30%] z-0">
            <img 
              src="/right.svg" 
              alt="Decoration" 
              className="h-[900px] w-auto"
              onLoad={() => console.log('Image loaded successfully')}
              onError={(e) => console.error('Image failed to load:', e)}
            />
          </div>
        </div>
      </div>

      {/* Navigation and Search Section */}
      <div className="w-full bg-white py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div 
            className={`font-sans text-2xl relative cursor-pointer transition-colors ${activeTab === 'discover' ? 'text-[#B50000]' : 'text-black hover:text-gray-600'}`}
            onClick={() => setActiveTab('discover')}
          >
            <p className="leading-normal">Discover</p>
            {activeTab === 'discover' && <div className="absolute -bottom-2 left-0 right-0 h-[3px] bg-[#B50000]" />}
          </div>
          <div 
            className={`font-sans text-2xl relative cursor-pointer transition-colors ${activeTab === 'explore' ? 'text-[#B50000]' : 'text-black hover:text-gray-600'}`}
            onClick={() => setActiveTab('explore')}
          >
            <p className="leading-normal">Explore</p>
            {activeTab === 'explore' && <div className="absolute -bottom-2 left-0 right-0 h-[3px] bg-[#B50000]" />}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl h-[50px] rounded-[25px] border border-black flex items-center px-4 mx-4">
            <div className="w-[27px] h-[27px] mr-4 flex-shrink-0">
              <svg className="w-full h-full" fill="none" viewBox="0 0 27 27">
                <path d="M22.05 23.625L14.9625 16.5375C14.4 16.9875 13.7531 17.3437 13.0219 17.6062C12.2906 17.8687 11.5125 18 10.6875 18C8.64375 18 6.91425 17.292 5.499 15.876C4.08375 14.46 3.37575 12.7305 3.375 10.6875C3.37425 8.6445 4.08225 6.915 5.499 5.499C6.91575 4.083 8.64525 3.375 10.6875 3.375C12.7298 3.375 14.4596 4.083 15.8771 5.499C17.2946 6.915 18.0023 8.6445 18 10.6875C18 11.5125 17.8688 12.2906 17.6063 13.0219C17.3438 13.7531 16.9875 14.4 16.5375 14.9625L23.625 22.05L22.05 23.625ZM10.6875 15.75C12.0938 15.75 13.2893 15.258 14.274 14.274C15.2588 13.29 15.7508 12.0945 15.75 10.6875C15.7493 9.2805 15.2573 8.08538 14.274 7.10213C13.2908 6.11888 12.0953 5.6265 10.6875 5.625C9.27975 5.6235 8.08463 6.11588 7.10213 7.10213C6.11963 8.08838 5.62725 9.2835 5.625 10.6875C5.62275 12.0915 6.11513 13.287 7.10213 14.274C8.08913 15.261 9.28425 15.753 10.6875 15.75Z" fill="black" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search for art..." 
              className="flex-1 outline-none text-lg bg-transparent text-black placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Main Content Container */}
      <main className="container mx-auto px-4 py-8">
        {/* Content Section - Changes based on active tab */}
        {activeTab === 'discover' ? (
          <div>
            {/* Community Art Section Title */}
            <div className="text-center mb-12">
              <h1 className="font-sans text-4xl md:text-5xl text-black leading-tight">Community Art</h1>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-2xl font-sans">Loading posts...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <p className="text-2xl font-sans text-red-600">Error: {error}</p>
              </div>
            )}

            {/* No Posts State */}
            {!isLoading && !error && filteredPosts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-2xl font-sans">No posts found.</p>
              </div>
            )}

            {/* Posts Grid */}
            <div className="flex flex-wrap justify-center gap-8">
              {!isLoading && !error && filteredPosts.map((post, index) => (
                <PostCard 
                  key={post._id}
                  post={post} 
                  index={index} 
                  isAuthenticated={isAuthenticated}
                  isCheckingAuth={isCheckingAuth}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Explore Section */
          <div>
            {/* Explore Title */}
            <div className="text-center mb-12">
              <h2 className="font-inter text-4xl md:text-5xl text-black leading-tight mb-4">
                Explore the different art styles of India!
              </h2>
            </div>

            {/* Art Styles Cards with Search */}
            <div className="max-w-6xl mx-auto space-y-6">
              {artStyles
                .filter(style => {
                  if (searchQuery === '') return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    style.name.toLowerCase().includes(query) ||
                    (style.state && style.state.toLowerCase().includes(query))
                  );
                })
                .map((style) => (
                  <div 
                    key={style.name}
                    className="w-full bg-white border border-gray-300 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col md:flex-row"
                    onClick={() => router.push(`/explore/${style.name.toLowerCase().replace(' ', '-')}`)}
                  >
                    {/* State Image - Side by side on desktop, stacked on mobile */}
                    <div className="w-full md:w-1/3 h-48 md:h-auto relative flex-shrink-0">
                      <img
                        src={style.image}
                        alt={`${style.name} Art`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400">
                                <span class="text-gray-600 font-semibold text-center">
                                  ${style.name}<br/>Art
                                </span>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex-1">
                      <p className="font-instrument-serif text-xl text-gray-700 mt-4 mb-6">
                        {style.name}
                      </p>
                      <p className="font-inter text-base text-gray-700 leading-relaxed">
                        {style.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}