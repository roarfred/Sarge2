using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using System.Threading;
using Sarge.Maps.GeoData;
using Sarge2.Api.Models;

namespace Sarge2.Api.Controllers
{
    [Route("api/[controller]")]
    public class ParseGpxController : Controller
    {
        [HttpPost("upload")]
        public GeoData ParseGpx(ParseGpxSettings postData)
        {
            using (var stream = postData.file.OpenReadStream())
            {
                var data = GeoData.FromStream(stream, Path.GetFileNameWithoutExtension(postData.file.FileName));
                data.SplitTracks(postData.maxDistance, postData.maxTime, postData.minTrackPoints);
                return data;
            }
        }
    }
}
