/*
 * Copyright (C) 2019 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 24/11/19.
 */
ko.components.register('condition-trajectory', {
    viewModel: function (params) {
        var self = this;
        var offsets = ["Very poor", "Poor", "Good", "Very good"];
        var trajectories = ["Improving", "Deteriorating", "Stable", "Unclear"];

        var width = 75;
        var boxWidth = 30;
        self.boxPosition = ko.computed(function() {
            var condition = ko.utils.unwrapObservable(params.condition);
            var index = offsets.indexOf(condition);
            return index * width + width/2 - boxWidth/2;
        });
        self.title = ko.computed(function() {
            var condition = ko.utils.unwrapObservable(params.condition);
            var trajectory = ko.utils.unwrapObservable(params.trajectory);
            return "Condition: "+condition+", Trajectory: " + trajectory;
        });

        self.trajectoryTemplate = ko.computed(function() {
            var trajectory = ko.utils.unwrapObservable(params.trajectory);
            if (trajectory) {
                return 'template-trajectory-'+trajectory.toLowerCase();
            }
            return 'template-trajectory-none';
        });

    },
    template:componentService.getTemplate('condition-trajectory')

});