using Sarge.Maps.GeoData;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Sarge.Maps.Tests
{
    public class HaversineTests
    {
        [Fact]
        public void DistanceTest()
        {
            var pos1 = new Position(-(5.0 + 42.0 / 60.0 + 53.0 / 60.0 / 60.0), 50.0 + 3.0 / 60.0 + 59.0 / 60.0 / 60.0);
            var pos2 = new Position(-(3.0 + 4.0 / 60.0 + 12.0 / 60.0 / 60.0), 58.0 + 38.0 / 60.0 + 38.0 / 60.0 / 60.0);

            var distance = Haversine.Distance(pos1.Latitude, pos1.Longitude, pos2.Latitude, pos2.Longitude);
            Assert.InRange(distance, 968800, 969000);
        }
    }
}
