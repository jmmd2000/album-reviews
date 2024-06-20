# AlbumReviews
![image](https://github.com/jmmd2000/album-reviews/assets/63932603/67ee12e3-25e7-492c-ae40-6a90a8abccb5)

This is V2 of my personal blog of album reviews. The first one can be found [here](https://github.com/jmmd2000/AlbumReviews).

The first one was built with just React, JS, CSS and react-router.
This one is built using the [T3 stack](https://create.t3.gg/): Next.js, TypesScript, tRPC, Prisma, TailwindCSS.

A step up from the V1, V2 is fully typesafe, with a proper backend and better built UI.

## Public pages

The public part of this blog has three main pages:

- Home
- Albums
- Artists

### Home

As you can see in the image above, the homepage consists of a welcome message with a link to a Spotify playlist of songs I have rated _Perfect_.
The image grid on the right shows my top 4 artists, and changes depending on the _artist leaderboard_ i.e. the scores for each artist.

### Albums

This page shows a grid of my album reviews, by default sorted with the latest reviews first. There are a number of other sorting options i.e. alphabetical, by score, by release year.
There is also an input where you can filter the list by album name, artist name or release year.

![image](https://github.com/jmmd2000/album-reviews/assets/63932603/30b7ecd0-fdaa-402e-aaeb-735da2dbf723)

Also, if you hover the artist name on one of these album cards, you get a summary of the artist score and my top 3 albums of theirs.

![hover](https://github.com/jmmd2000/album-reviews/assets/63932603/378bdcc5-b865-4505-b391-6ee48b3c07c5)

### Album Review

This page shows the actual review for a given album. It gives a few details about the album such as the number of tracks, total length, release date etc, along with the album cover.

![image](https://github.com/jmmd2000/album-reviews/assets/63932603/3ade9262-3ed6-4e68-877b-c4f5efa48001)

Below those, it displays my actual review, along side what I consider the best and worst songs on the album, and then the tracklist, with the rating I give each song.

### Artists

The artists page is very similar to the albums page, the difference is pretty obvious

![image](https://github.com/jmmd2000/album-reviews/assets/63932603/479fed1c-af45-41fc-b39c-0b3d215685dd)

### Artist Details

This page is still a work in progress and has a few cool features.
The first section is just a few details about the artist, how many reviews I have for them, their score, their overall rank etc.
The second section shows each song from each album that falls under a given rating

![image](https://github.com/jmmd2000/album-reviews/assets/63932603/55ee2cbe-4f15-44b0-99b3-f8755beccc51)

The section below that shows a graph of the artists scores over time, and the last section just displays all the reviews for that artist.

![image](https://github.com/jmmd2000/album-reviews/assets/63932603/fd99b48b-a01c-4489-9a08-9944aab8cbf5)

## Private pages

There are a number of admin pages that are not visible to the public:

- New
- Saved

### New

This page allows me to query the Spotify API for albums when I want to add a new review.

![image](https://github.com/jmmd2000/album-reviews/assets/63932603/046c49c5-7d48-480f-9d29-f3a7de614e36)

From here I can choose an album to review, or click the _bookmark_ icon to save it for later.
If an album is already reviewed or bookmarked, it displays as such.
If I choose to review it, it brings me to a page nearly identical to the final review page, with the only differences being the fields are inputs and each track has a dropdown to enter the rating.

![image](https://github.com/jmmd2000/album-reviews/assets/63932603/0ff79b4f-1f21-4ebf-934c-146949271951)

Once I submit the review, it creates the artist if they don't already exist in the database, creates the review, and updates other values like the overall artist leaderboard, artist scores, album scores etc.

### Saved

This page allows me to bookmark albums that I want to review for later, and it provides me with a random album each time I refresh.

![image](https://github.com/jmmd2000/album-reviews/assets/63932603/d12a62fc-d60a-44ed-8286-217f1a5d0d6f)

The selected album isn't technically random, it's specifically the next album in the release order for that artist, so I never listen to newer albums before older ones.

