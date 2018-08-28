import {Relationship, Serializable} from '../WebOrmDecorators'
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

  @Relationship(GeoType)
  @OneToOne(type => GeoType, { eager: true })
  @JoinColumn({ name: 'geo_type_id' })
  geoType: GeoType

  @Relationship(Translation)
  @OneToOne(type => Translation, { eager: true })
  @JoinColumn({ name: 'name_translation_id' })
  nameTranslation: Translation

  @ManyToMany(type => Photo, photo => photo.geos, { eager: true })
  @JoinTable({ name: 'geo_photo' })
  photos: Photo[]

}
