import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, JoinTable, ManyToMany} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from '../../services/JSONUtil'
import GeoType from './GeoType'
import Translation from './Translation'
import Photo from './Photo'

@Entity()
export default class Geo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  geoTypeId: string
  @Column() @Serializable
  parentId: string
  @Column({ type: 'double', nullable: true }) @Serializable
  latitude: number
  @Column({ type: 'double', nullable: true }) @Serializable
  longitude: number
  @Column({ type: 'double', nullable: true }) @Serializable
  altitude: number
  @Column() @Serializable
  nameTranslationId: string

  @Relationship(type => GeoType)
  @OneToOne(type => GeoType)
  @JoinColumn()
  geoType: GeoType

  @Relationship(type => Translation)
  @OneToOne(type => Translation)
  @JoinColumn()
  nameTranslation: Translation

  @Relationship(type => Photo)
  @ManyToMany(type => Photo, photo => photo.geos)
  @JoinTable({ name: 'geo_photo' })
  photos: Photo[]

}
