using Sarge.Maps.Gpx;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Sarge.Maps.Tests
{
    public class GpxTests
    {
        private Stream GetTestFile()
        {
            return File.OpenRead("../../TestData/GpxData.xml");
        }

        [Fact]
        public void ParsingFile_ShouldHaveData()
        {
            using (var file = GetTestFile())
            {
                var data = Parser.Parse(file);
                Assert.NotNull(data);
            }
        }

        [Fact]
        public void TestFile_ShouldHaveTracks()
        {
            using (var file = GetTestFile())
            {
                var data = Parser.Parse(file);
                Assert.NotNull(data.Tracks);
                Assert.True(data.Tracks.Count() > 0);
            }
        }
        [Fact]
        public void TestFile_ShouldHaveNameAndDescription()
        {
            using (var file = GetTestFile())
            {
                var data = Parser.Parse(file);
                Assert.NotNull(data.Tracks);
                Assert.False(String.IsNullOrEmpty(data.Tracks.First().Name));
                Assert.False(String.IsNullOrEmpty(data.Tracks.First().Description));
            }
        }

        [Fact]
        public void TestFile_ShouldHaveTrackSegments()
        {
            using (var file = GetTestFile())
            {
                var data = Parser.Parse(file);
                Assert.NotNull(data.Tracks);
                Assert.True(data.Tracks.First().Segments.Count() > 0);
            }
        }

        [Fact]
        public void TestFile_ShouldHaveWaypoints()
        {
            using (var file = GetTestFile())
            {
                var data = Parser.Parse(file);
                Assert.NotNull(data.Waypoints);
                Assert.True(data.Waypoints.Count() > 0);
            }
        }
        [Fact]
        public void TestFile_WaypointsShouldHaveNameAndSymbol()
        {
            using (var file = GetTestFile())
            {
                var data = Parser.Parse(file);
                Assert.NotNull(data.Waypoints);
                Assert.False(String.IsNullOrEmpty(data.Waypoints.First().Name));
                Assert.False(String.IsNullOrEmpty(data.Waypoints.First().Symbol));
            }
        }
    }
}
