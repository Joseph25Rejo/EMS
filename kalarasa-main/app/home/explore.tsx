"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Define type for art style
interface ArtStyle {
  name: string;
  state: string;
  description: string;
  image: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Art styles data with state information
  const artStyles: ArtStyle[] = [
    {
      name: "Karnataka",
      state: "Karnataka",
      description: "The state's artistic heritage blends influences from the Chalukyas, Hoysalas, Vijayanagara rulers, Mysore Wodeyars, and local folk traditions.",
      image: "/ka1.jpg"
    },
    {
      name: "Rajasthan",
      state: "Rajasthan",
      description: "Known for vibrant miniature paintings, intricate mirror work, and desert-inspired folk art traditions that reflect royal heritage.",
      image: "/rj1.jpg"
    },
    {
      name: "Kerala",
      state: "Kerala",
      description: "Features unique mural paintings, Kathakali masks, and traditional art forms influenced by coastal culture and spice trade history.",
      image: "/ke1.jpg"
    },
    {
      name: "West Bengal",
      state: "West Bengal",
      description: "Rich in Pattachitra paintings, terracotta work, and modern artistic movements that blend traditional Bengali culture with contemporary themes.",
      image: "/wb1.jpg"
    }
  ];

  return (
    <div className="bg-white" style={{ marginTop: '5px' }}>
      {/* Search Section */}
      <div className="w-full bg-white py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl h-[50px] rounded-[25px] border border-black flex items-center px-4 mx-4">
            <div className="w-[27px] h-[27px] mr-4 flex-shrink-0">
              <svg className="w-full h-full" fill="none" viewBox="0 0 27 27">
                <path d="M22.05 23.625L14.9625 16.5375C14.4 16.9875 13.7531 17.3437 13.0219 17.6062C12.2906 17.8687 11.5125 18 10.6875 18C8.64375 18 6.91425 17.292 5.499 15.876C4.08375 14.46 3.37575 12.7305 3.375 10.6875C3.37425 8.6445 4.08225 6.915 5.499 5.499C6.91575 4.083 8.64525 3.375 10.6875 3.375C12.7298 3.375 14.4596 4.083 15.8771 5.499C17.2946 6.915 18.0023 8.6445 18 10.6875C18 11.5125 17.8688 12.2906 17.6063 13.0219C17.3438 13.7531 16.9875 14.4 16.5375 14.9625L23.625 22.05L22.05 23.625ZM10.6875 15.75C12.0938 15.75 13.2893 15.258 14.274 14.274C15.2588 13.29 15.7508 12.0945 15.75 10.6875C15.7493 9.2805 15.2573 8.08538 14.274 7.10213C13.2908 6.11888 12.0953 5.6265 10.6875 5.625C9.27975 5.6235 8.08463 6.11588 7.10213 7.10213C6.11963 8.08838 5.62725 9.2835 5.625 10.6875C5.62275 12.0915 6.11513 13.287 7.10213 14.274C8.08913 15.261 9.28425 15.753 10.6875 15.75Z" fill="black" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search for art styles or states..." 
              className="flex-1 outline-none text-lg bg-transparent text-black placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Main Content Container */}
      <main className="container mx-auto px-4 py-16">
        {/* Explore Title */}
        <div className="text-center mb-12">
          <h2 className="font-['Inter'] text-4xl md:text-5xl text-black leading-tight mb-4">
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
                (style.state && style.state.toLowerCase().includes(query)) ||
                style.description.toLowerCase().includes(query)
              );
            })
            .map((style) => (
              <div 
                key={style.name}
                className="w-full bg-white border border-gray-300 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/explore/${style.name.toLowerCase().replace(' ', '-')}`)}
              >
                {/* State Image */}
                <div className="h-48 w-full relative">
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
                <div className="p-6">
                  <h3 className="font-['Instrument_Serif'] text-2xl md:text-3xl text-black mb-3">
                    {style.name}
                  </h3>
                  <p className="font-['Inter'] text-base text-gray-700 leading-relaxed">
                    {style.description}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {/* No Results State */}
        {artStyles.filter(style => {
          if (searchQuery === '') return true;
          const query = searchQuery.toLowerCase();
          return (
            style.name.toLowerCase().includes(query) ||
            (style.state && style.state.toLowerCase().includes(query)) ||
            style.description.toLowerCase().includes(query)
          );
        }).length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl font-sans text-gray-600">
              No art styles found for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
