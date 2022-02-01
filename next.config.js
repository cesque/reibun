module.exports = {
    reactStrictMode: true,
    // Will be available on both server and client
    publicRuntimeConfig: {
        NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    }
}
