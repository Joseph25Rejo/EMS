"use client";
import { useState } from 'react';

interface FormData {
  email: string;
  title: string;
  description: string;
  tags: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: Record<string, unknown>;
}

function Group3() {
  return (
    <div className="absolute contents left-[100px] top-[45.25px]">
      {/* Kalarasa text removed since it's in the logo */}
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute top-0 left-[25px] h-[120px] flex items-center">
      <div className="w-[75px] h-[64px] mr-4">
        <img src="/left.svg" alt="Kalarasa Logo" className="block size-full" />
      </div>

      {/* Kalarasa Text */}
      <div className="font-sans text-[33.75px] text-black">
        <p className="leading-normal">Kalarasa</p>
      </div>
    </div>

  );
}

function Group5() {
  return (
    <div className="absolute contents left-[25px] top-[0px]">
      <Group3 />
      <Logo />
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute right-[25px] size-[42.5px] top-[45px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 43 43">
        <g id="Group 10">
          <circle cx="21.25" cy="21.25" id="Ellipse 5" r="20.5" stroke="#B50000" strokeWidth="1.5" />
          <circle cx="21.25" cy="13.25" id="Ellipse 6" r="5.75" stroke="#B50000" />
          <path d="M21.25 19 L27 30 H15 Z" id="Polygon 4" stroke="#B50000" />
        </g>
      </svg>
    </div>
  );
}

export default function CreatePage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    title: '',
    description: '',
    tags: ''
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImages(e.target.files);
  };

  const createPost = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append("email", formData.email);
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("tags", formData.tags);

      if (images) {
        for (let i = 0; i < images.length; i++) {
          form.append("images", images[i]);
        }
      }

      const res = await fetch("https://thecodeworks.in/kalarasa/create_post", {
        method: "POST",
        body: form
      });
      
      const responseData: ApiResponse = await res.json();
      console.log('Post created:', responseData);
      
      // Reset form on success
      if (responseData.success) {
        setFormData({
          email: '',
          title: '',
          description: '',
          tags: ''
        });
        setImages(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <div className="bg-[#ffffff] relative w-full min-h-screen overflow-auto">
        {/* Fixed Header */}
        <div className="relative h-[120px] w-full">
          <Group5 />
          <Group10 />
        </div>
        
        {/* Purple Background Section with Text and Image */}
        <div 
          className="relative w-full h-[371px] overflow-hidden" 
          style={{ backgroundColor: '#EB96F1' }}
        >
          <div className="relative w-full h-full">
            <div className="absolute left-[50px] top-1/2 transform -translate-y-1/2 max-w-[500px] z-10">
              <h2 className="font-['Instrument_Serif'] text-5xl leading-tight text-black">
                Create your post.<br />
                Share Indian art with the world.
              </h2>
            </div>
            <div className="absolute right-[20px] top-1/2 transform -translate-y-1/2 z-0">
              <img 
                src="/right.svg" 
                alt="Decoration" 
                className="h-[300px] w-auto"
                onLoad={() => console.log('Image loaded successfully')}
                onError={(e) => console.error('Image failed to load:', e)}
              />
            </div>
          </div>
        </div>
        
        {/* Form Section */}
        <div className="relative w-full px-[52px] py-8">
          <div className="font-['Inter'] font-normal text-[#000000] text-[28px] mb-6">
            <p>Create a Post</p>
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <div className="bg-[#f4f3f3] h-[45px] rounded-[5px] w-full max-w-[900px] relative">
              <div aria-hidden="true" className="absolute border border-[#000000] border-solid inset-0 pointer-events-none rounded-[5px]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email (Creator)"
                className="absolute bg-transparent h-full w-full px-4 font-['Inter'] font-normal text-[18px] text-[#000000] outline-none rounded-[5px] placeholder:text-[#666666]"
              />
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <div className="bg-[#f4f3f3] h-[45px] rounded-[5px] w-full max-w-[900px] relative">
              <div aria-hidden="true" className="absolute border border-[#000000] border-solid inset-0 pointer-events-none rounded-[5px]" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Title"
                className="absolute bg-transparent h-full w-full px-4 font-['Inter'] font-normal text-[18px] text-[#000000] outline-none rounded-[5px] placeholder:text-[#666666]"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div className="mb-6">
            <div className="bg-[#f4f3f3] h-[80px] rounded-[5px] w-full max-w-[900px] relative">
              <div aria-hidden="true" className="absolute border border-[#000000] border-solid inset-0 pointer-events-none rounded-[5px]" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="absolute bg-transparent h-full w-full p-4 font-['Inter'] font-normal text-[18px] text-[#000000] outline-none rounded-[5px] resize-none placeholder:text-[#666666]"
              />
            </div>
          </div>

          {/* Tags Input */}
          <div className="mb-6">
            <div className="bg-[#f4f3f3] h-[45px] rounded-[5px] w-full max-w-[900px] relative">
              <div aria-hidden="true" className="absolute border border-[#000000] border-solid inset-0 pointer-events-none rounded-[5px]" />
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Tags (comma separated)"
                className="absolute bg-transparent h-full w-full px-4 font-['Inter'] font-normal text-[18px] text-[#000000] outline-none rounded-[5px] placeholder:text-[#666666]"
              />
            </div>
          </div>

          {/* Upload Section and Submit Button Row */}
          <div className="flex flex-wrap items-start gap-8 mb-8">
            {/* Upload Section */}
            <div className="bg-[#ffffff] h-[180px] w-[450px] relative">
              <div aria-hidden="true" className="absolute border border-[#000000] border-dashed inset-[-0.5px] pointer-events-none" />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="absolute bg-[#f4f3f3] h-28 left-[25px] top-[28px] w-[400px]">
                <div aria-hidden="true" className="absolute border border-[#000000] border-solid inset-0 pointer-events-none" />
              </div>
              <div className="absolute font-['Inter'] font-normal leading-[0] left-[225px] not-italic text-[#444444] text-[16px] text-center top-[6px] translate-x-[-50%]">
                <p className="leading-[normal]">Uploads</p>
              </div>
              <div className="absolute font-['Inter'] font-normal leading-[0] left-[225px] not-italic text-[#000000] text-[50px] text-center text-nowrap top-[50px] translate-x-[-50%]">
                <p className="leading-[normal] whitespace-pre">+</p>
              </div>
              {images && (
                <div className="absolute bottom-2 left-2 right-2 text-xs text-gray-600 font-['Inter']">
                  {images.length} file{images.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center h-[180px]">
              <button
                onClick={createPost}
                disabled={isLoading}
                className="bg-[#EB96F1] hover:bg-[#e085ed] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg border border-black font-['Inter'] text-[16px] text-black transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: '#EB96F1' }}
              >
                {isLoading ? 'Creating Post...' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}