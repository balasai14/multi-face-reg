const VideoFeed = ({ title, src }) => {
    return (
        <div>
            <h1>{title}</h1>
            <img src={src} alt={`${title} Video Feed`} />
        </div>
    );
};

export default VideoFeed;
