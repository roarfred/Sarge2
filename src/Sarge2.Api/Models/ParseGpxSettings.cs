using Microsoft.AspNetCore.Http;
using System;

namespace Sarge2.Api.Models
{
    public class ParseGpxSettings
    {
        public int minTrackPoints { get; set; } = 0;
        public TimeSpan maxTime { get; set; } = TimeSpan.Zero;
        public int maxDistance { get; set; } = 0;
        public IFormFile file { get; set; }
    }
}
