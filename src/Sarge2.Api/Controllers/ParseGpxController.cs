using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using System.Threading;
using Sarge.Maps.GeoData;

namespace Sarge2.Api.Controllers
{
    [Route("api/[controller]")]
    public class ParseGpxController : Controller
    {
        [HttpPost("upload")]
        public GeoData ParseGpx(myFile postData)
        {
            using (var stream = postData.file.OpenReadStream())
            {
                var data = GeoData.FromStream(stream, Path.GetFileNameWithoutExtension(postData.file.FileName));
                data.SplitTracks(500, new TimeSpan(0, 5, 0), 10);
                return data;
            }
        }
    }
    

    public class myFile
    {
        public string myParam { get; set; }
        public IFormFile file { get; set; }
    }
}
