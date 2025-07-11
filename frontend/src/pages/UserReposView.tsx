import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router";
import { useState } from "react";
import Layout from "../components/Layout";
import LEFT_ARROW from "../assets/left-arrow.svg";

export default function UserReposView() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Debug: Log the username
  console.log('UserReposView - Username:', username);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching profile for:', username);
      const res = await fetch(`https://api.github.com/users/${username}`);
      console.log('Profile response status:', res.status);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("User not found");
        }
        if (res.status === 403) {
          // Check if it's rate limit or forbidden
          const errorData = await res.json().catch(() => ({}));
          if (errorData.message && errorData.message.includes('rate limit')) {
            throw new Error("RATE_LIMIT");
          }
          throw new Error("API rate limit exceeded. Please try again later.");
        }
        throw new Error(`Failed to fetch user profile: ${res.status}`);
      }
      const data = await res.json();
      console.log('Profile data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const fetchUserRepos = async () => {
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (!res.ok) {
        if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          if (errorData.message && errorData.message.includes('rate limit')) {
            throw new Error("RATE_LIMIT");
          }
          throw new Error("API rate limit exceeded. Please try again later.");
        }
        throw new Error(`Failed to fetch repositories: ${res.status}`);
      }
      const allRepos = await res.json();
      
      // Filter to only show public repositories
      return allRepos.filter((repo: any) => !repo.private);
    } catch (error) {
      console.error('Error fetching user repos:', error);
      throw error;
    }
  };

  const { data: userProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: fetchUserProfile,
    retry: (failureCount, error) => {
      // Don't retry if it's a rate limit error
      if (error.message === "RATE_LIMIT") return false;
      return failureCount < 2;
    },
    retryDelay: 2000,
  });

  const { data: repos, isLoading: reposLoading, error: reposError } = useQuery({
    queryKey: ["userRepos", username],
    queryFn: fetchUserRepos,
    enabled: !!userProfile, // Only fetch repos after profile is loaded
    retry: (failureCount, error) => {
      // Don't retry if it's a rate limit error
      if (error.message === "RATE_LIMIT") return false;
      return failureCount < 2;
    },
    retryDelay: 2000,
  });

  // Filter repos based on search query
  const filteredRepos = repos?.filter((repo: any) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">User Not Found</h2>
            <p className="text-red-700 mb-4">
              The GitHub user "{username}" doesn't exist or their profile is not accessible.
            </p>
            <Link 
              to="/" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="py-8 px-4 space-y-6 max-w-7xl mx-auto font-sans">
        {/* Back Navigation */}
        <Link to="/">
          <div className="flex items-center gap-4 text-lg cursor-pointer hover:text-blue-600 mb-6">
            <img src={LEFT_ARROW} className="w-5 h-5" alt="Back" /> 
            Back to Home
          </div>
        </Link>

        {/* User Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            <img 
              src={userProfile?.avatar_url} 
              alt={`${username}'s avatar`}
              className="w-20 h-20 rounded-full border border-gray-200"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {userProfile?.name || username}
              </h1>
              <p className="text-gray-600 mb-2">@{username}</p>
              {userProfile?.bio && (
                <p className="text-gray-700 mb-3">{userProfile.bio}</p>
              )}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>📍 {userProfile?.location || "Location not specified"}</span>
                <span>👥 {userProfile?.followers || 0} followers</span>
                <span>📂 {userProfile?.public_repos || 0} public repositories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredRepos.length} of {repos?.length || 0} repositories
            </div>
          </div>
        </div>

        {/* Loading State */}
        {reposLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading repositories...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {reposError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Repositories</h3>
            <p className="text-red-700">Failed to load repositories for this user.</p>
          </div>
        )}

        {/* Repositories Grid */}
        {repos && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Public Repositories
              {searchQuery && (
                <span className="text-base font-normal text-gray-600 ml-2">
                  - searching for "{searchQuery}"
                </span>
              )}
            </h2>
            
            {filteredRepos.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-2">No Repositories Found</h3>
                  <p className="text-gray-600">
                    {searchQuery 
                      ? `No repositories match "${searchQuery}"`
                      : "This user has no public repositories."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredRepos.map((repo: any) => (
                  <div
                    key={repo.id}
                    className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => navigate(`/public/${repo.owner.login}/${repo.name}`, {
                      state: { fromUserRepos: true }
                    })}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-lg font-semibold text-gray-900 break-words">
                        {repo.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {repo.fork && "🍴"}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {repo.description || "No description available"}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {repo.language}
                        </span>
                      )}
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🍴 {repo.forks_count}</span>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}