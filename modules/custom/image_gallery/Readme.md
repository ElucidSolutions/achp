Image Gallery Readme
====================

The Image Gallery module extends the Flickity Carousel and Flickity
View modules to create the Image Gallerys.

To create a Image Gallery, create two Flickity Groups
(admin/config/flickity) and configure one of them to act as a
nav element for the other (See the "As nav for" property under
admin/config/flickity).

Next, create a Flickity view for each group. A Flickity view is a
view that has the following view settings:

* Format: Flickity
* Show: Fields
* Fields: Content: SOME IMAGE FIELD

This module will style the nav and primary elements and attach the
necessary JS event handlers needed to provide lightbox behavior, etc.
