﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GradePortalAPI.Dtos
{
    public class EvaluateDto
    {
        public string UserId { get; set; }
        public string SkillId { get; set; }
        public string ExpertId { get; set; }
        public int Value { get; set; }
    }
}
