namespace Sarge.Maps.GeoData
{
    public class Position
    {
        public double Longitude { get; set; }
        public double Latitude { get; set; }

        public Position(double longitude, double latitude)
        {
            Longitude = longitude;
            Latitude = latitude;
        }
    }
}